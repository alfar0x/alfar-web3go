import { Axios } from "axios";
import { ethers } from "ethers";

import { isToday } from "date-fns";
import { randomFloat, shuffle } from "@alfar/helpers";
import { MAX_GAS_PRICE, MIN_GAS_PRICE } from "../helpers/constants";
import { logger, wait } from "../helpers/common";
import {
  getGifts,
  getGoldLeaves,
  getNftSync,
  getQuiz,
  getQuizes,
  getRecentCheckIns,
  postChallenge,
  postGiftOpen,
  postNonce,
  postQuizAnswer,
  putCheckIn,
} from "./requests";
import { getLoginMessage } from "./web3";
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

  async login() {
    const { nonce } = await postNonce({
      client: this.client,
      address: this.wallet.address,
    });

    const msg = getLoginMessage({
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

  async isPassportAvailable() {
    const balanceStr = await this.contract.balanceOf(this.wallet.address);
    return Number(balanceStr) !== 0;
  }

  async mint() {
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

  async giftOpen() {
    await getNftSync({ client: this.client });

    const gifts = await getGifts({ client: this.client });

    const filtered = gifts.filter(
      (g) => allowedGiftNames.includes(g.name) && !g.openedAt,
    );

    for (const gift of filtered) {
      await postGiftOpen({ client: this.client, id: gift.id });
      logger.info(`${this.name} | opened gift: ${gift.name}`);
      await wait(5, 10);
    }

    return filtered.length;
  }

  async questions(quizId: string) {
    let answeredCount = 0;

    const quizAnswers = answers[quizId];

    if (!quizAnswers) return answeredCount;

    const quiz = await getQuiz({ client: this.client, id: quizId });

    logger.info(`${this.name} | solving ${quiz.title}`);

    for (const question of quiz.items) {
      if (question.answers?.length) continue;

      const questionAnswers = quizAnswers[question.sortIndex];

      const answers = questionAnswers.map((a) =>
        a === "address" ? this.wallet.address : a,
      );

      await postQuizAnswer({ client: this.client, id: question.id, answers });
      await getQuiz({ client: this.client, id: quizId });

      logger.info(`${this.name} | question #${question.sortIndex} solved`);

      answeredCount += 1;

      await wait(5, 10);
    }

    return answeredCount;
  }

  async quizes() {
    let answeredCount = 0;

    const quizes = await getQuizes({ client: this.client });

    for (const quiz of shuffle(quizes)) {
      if (quiz.currentProgress !== quiz.totalItemCount) {
        answeredCount += await this.questions(quiz.id);
      }
    }

    return answeredCount;
  }

  async checkIn() {
    const isChecked = await this.checkIsChecked();
    if (isChecked) return false;

    await putCheckIn({ client: this.client });
    return true;
  }

  async goldLeaves() {
    const data = await getGoldLeaves({ client: this.client });

    return data.total;
  }

  async checkIsChecked() {
    const recentCheckIns = await getRecentCheckIns({ client: this.client });

    const todaysCheckIn = recentCheckIns.find((c) => isToday(c.date));

    if (!todaysCheckIn) return false;

    return todaysCheckIn.status === "checked";
  }

  async run() {
    logger.info(`${this.wallet.address} | start`);

    await this.login();
    logger.info(`${this.name} | login success`);
    await wait(5, 10);

    const hash = await this.mint();

    if (hash) {
      logger.info(
        `${this.name} | passport mint success https://bscscan.com/tx/${hash}`,
      );
      await wait(5, 10);
    }

    const openedGiftsCount = await this.giftOpen();
    logger.info(`${this.name} | opened ${openedGiftsCount} gifts`);
    await wait(5, 10);

    const answeredCount = await this.quizes();
    logger.info(`${this.name} | answered ${answeredCount} questions`);
    await wait(5, 10);

    const isChecked = await this.checkIn();

    if (isChecked) {
      logger.info(`${this.name} | check in success`);
    } else {
      logger.info(`${this.name} | already checked in`);
    }

    await wait(5, 10);

    const totalGoldLeaves = await this.goldLeaves();
    logger.info(`${this.name} | current leave count: ${totalGoldLeaves}`);
    await wait(5, 10);

    return { totalGoldLeaves };
  }
}

export default Worker;
