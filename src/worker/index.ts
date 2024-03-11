/* eslint-disable max-lines */
import { Axios } from "axios";
import { ethers } from "ethers";

import { isToday } from "date-fns";
import { randomFloat, shuffle, sleep } from "@alfar/helpers";
import {
  LOTTERY_LEAVES_PRICE,
  MAX_GAS_PRICE,
  MIN_GAS_PRICE,
} from "../helpers/constants";
import { logger, wait } from "../helpers/common";
import {
  getCheckInStreakDays,
  getGifts,
  getGoldLeaves,
  getLotteryOffchain,
  getNftSync,
  getQuiz,
  getQuizes,
  getRecentCheckIns,
  postChallenge,
  postGiftOpen,
  postLotteryTry,
  postNonce,
  postQuizAnswer,
  putCheckIn,
} from "./requests";
import { getLoginAirdropMessage, getLoginReikiMessage } from "./web3";
import answers from "./answers";

const allowedGiftNames = ["Welcome Gift"];

class Worker {
  private readonly name: string;
  private readonly client: Axios;
  private readonly wallet: ethers.Wallet;
  private readonly contract: ethers.Contract;

  constructor(params: {
    name: string;
    client: Axios;
    wallet: ethers.Wallet;
    contract: ethers.Contract;
  }) {
    const { name, client, wallet, contract } = params;

    this.name = name;
    this.client = client;
    this.wallet = wallet;
    this.contract = contract;
  }

  private async loginReiki() {
    const { nonce } = await postNonce({
      client: this.client,
      address: this.wallet.address,
    });

    const msg = getLoginReikiMessage({
      address: this.wallet.address,
      nonce: nonce,
    });

    const signature = await this.wallet.signMessage(msg);
    const jsonMessage = JSON.stringify({ msg });

    const responseBody = await postChallenge({
      client: this.client,
      address: this.wallet.address,
      challenge: jsonMessage,
      nonce,
      signature,
    });

    const token = responseBody.extra.token;

    this.client.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  private async loginAirdrop() {
    const { nonce } = await postNonce({
      client: this.client,
      address: this.wallet.address,
    });

    const msg = getLoginAirdropMessage({
      address: this.wallet.address,
      nonce: nonce,
    });

    const signature = await this.wallet.signMessage(msg);
    const jsonMessage = JSON.stringify({ msg });

    const responseBody = await postChallenge({
      client: this.client,
      address: this.wallet.address,
      challenge: jsonMessage,
      nonce,
      signature,
    });

    const token = responseBody.extra.token;

    this.client.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  private async isPassportAvailable() {
    const balanceStr = await this.contract.balanceOf(this.wallet.address);
    return Number(balanceStr) !== 0;
  }

  private async mint() {
    const isPassportAvailable = await this.isPassportAvailable();

    if (isPassportAvailable) return null;

    const contract = this.contract.connect(this.wallet);

    const tx = await contract.safeMint(this.wallet.address, {
      gasPrice: ethers.utils.parseUnits(
        randomFloat(MIN_GAS_PRICE, MAX_GAS_PRICE, 2).toString(),
        "gwei",
      ),
    });

    const receipt = await tx.wait();

    if (receipt?.status !== 1) throw new Error(`passport mint failed`);

    return receipt.transactionHash;
  }

  private async giftOpen() {
    await getNftSync({ client: this.client });

    const gifts = await getGifts({ client: this.client });

    const filtered = gifts.filter(
      (g) => allowedGiftNames.includes(g.name) && !g.openedAt,
    );

    for (const gift of filtered) {
      await postGiftOpen({ client: this.client, id: gift.id });
      logger.info(`${this.name} | gift opened: ${gift.name}`);
      await wait(5, 10);
    }

    return filtered.length;
  }

  private async questions(quizId: string) {
    let answeredCount = 0;

    const quizAnswers = answers[quizId];

    if (!quizAnswers) return answeredCount;

    const quiz = await getQuiz({ client: this.client, id: quizId });

    logger.info(`${this.name} | answering ${quiz.title}`);

    for (const question of quiz.items) {
      if (question.answers?.length) continue;

      const questionAnswers = quizAnswers[question.sortIndex];

      const answers = questionAnswers.map((a) =>
        a === "address" ? this.wallet.address : a,
      );

      await postQuizAnswer({ client: this.client, id: question.id, answers });
      await getQuiz({ client: this.client, id: quizId });

      logger.info(`${this.name} | question #${question.sortIndex} answered`);

      answeredCount += 1;

      await wait(5, 10);
    }

    return answeredCount;
  }

  private async quizes() {
    let answeredCount = 0;

    const quizes = await getQuizes({ client: this.client });

    for (const quiz of shuffle(quizes)) {
      if (quiz.currentProgress !== quiz.totalItemCount) {
        answeredCount += await this.questions(quiz.id);
      }
    }

    return answeredCount;
  }

  private async checkIn() {
    const isChecked = await this.checkIsChecked();
    if (isChecked) return false;

    await putCheckIn({ client: this.client });
    return true;
  }

  private async goldLeaves() {
    const data = await getGoldLeaves({ client: this.client });

    return data.total;
  }

  private async checkIsChecked() {
    const recentCheckIns = await getRecentCheckIns({ client: this.client });

    const todaysCheckIn = recentCheckIns.find((c) => isToday(c.date));

    if (!todaysCheckIn) return false;

    return todaysCheckIn.status === "checked";
  }

  private async checkInStreak() {
    const data = await getCheckInStreakDays({ client: this.client });

    return data;
  }

  private async playLottery() {
    const lotteryOffchainData = await getLotteryOffchain({
      client: this.client,
    });

    let spins = Math.floor(
      lotteryOffchainData.userGoldLeafCount / LOTTERY_LEAVES_PRICE,
    );

    logger.info(`${this.name} | spins available: ${spins}`);

    if (spins <= 0) return lotteryOffchainData;

    while (spins > 0) {
      const { prize } = await postLotteryTry({ client: this.client });
      logger.info(`${this.name} | prize: ${prize}`);
      spins -= 1;
      await wait(3, 10);
    }

    const updatedLotteryOffchainData = await getLotteryOffchain({
      client: this.client,
    });

    return updatedLotteryOffchainData;
  }

  async register() {
    logger.info(`${this.wallet.address} | start`);

    await this.loginReiki();
    logger.info(`${this.name} | login success`);
    await wait(5, 10);

    const hash = await this.mint();

    if (hash) {
      logger.info(
        `${this.name} | passport mint success https://bscscan.com/tx/${hash}`,
      );
      await wait(5, 10);
    } else {
      await sleep(1);
    }

    let openedGifts = 0;

    try {
      openedGifts = await this.giftOpen();
      logger.info(`${this.name} | opened gifts: ${openedGifts}`);
    } catch (error: any) {
      logger.error(`${this.name} | opening gift error ${error?.message}`);
    }
    await wait(5, 10);

    let answeredQuestions = 0;

    try {
      answeredQuestions = await this.quizes();
      logger.info(`${this.name} | answered questions: ${answeredQuestions}`);
    } catch (error: any) {
      logger.error(`${this.name} | answering quizes error ${error?.message}`);
    }
    await wait(5, 10);

    try {
      const isChecked = await this.checkIn();

      if (isChecked) {
        logger.info(`${this.name} | check in success`);
      } else {
        logger.info(`${this.name} | already checked in`);
      }
    } catch (error: any) {
      logger.error(`${this.name} | check in error ${error?.message}`);
    }
    await wait(5, 10);

    const totalGoldLeaves = await this.goldLeaves();
    const checkInStreak = await this.checkInStreak();

    logger.info(
      `${this.name} | leaves: ${totalGoldLeaves} | streak: ${checkInStreak}`,
    );

    return {
      totalGoldLeaves,
      checkInStreak,
      openedGifts,
      answeredQuestions,
    };
  }

  async collect() {
    logger.info(`${this.wallet.address} | start`);

    await this.loginReiki();
    logger.info(`${this.name} | login success`);
    await wait(2);

    try {
      const isChecked = await this.checkIn();

      if (isChecked) {
        logger.info(`${this.name} | check in success`);
      } else {
        logger.info(`${this.name} | already checked in`);
      }
    } catch (error: any) {
      logger.error(`${this.name} | check in error ${error?.message}`);
    }

    await wait(2);

    const totalGoldLeaves = await this.goldLeaves();
    const checkInStreak = await this.checkInStreak();

    logger.info(
      `${this.name} | leaves: ${totalGoldLeaves} | streak: ${checkInStreak}`,
    );

    return { totalGoldLeaves, checkInStreak };
  }

  async lottery() {
    logger.info(`${this.wallet.address} | start`);

    await this.loginAirdrop();
    logger.info(`${this.name} | login success`);
    await wait(2);

    const { userGoldLeafCount, pieceNum, chipNum } = await this.playLottery();

    logger.info(
      `${this.name} | leaves: ${userGoldLeafCount} | peaces: ${pieceNum} | chips: ${chipNum}`,
    );

    return { userGoldLeafCount, pieceNum, chipNum };
  }
}

export default Worker;
