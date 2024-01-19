import { Axios } from "axios";
import { ethers } from "ethers";

import { isToday } from "date-fns";
import { sleep } from "../helpers/common";
import { MAX_GAS_PRICE, MIN_GAS_PRICE } from "../helpers/constants";
import { randomFloat } from "../helpers/random";
import logger from "../helpers/logger";
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

  async nftCount() {
    const balanceStr = await this.contract.balanceOf(this.wallet.address);
    return Number(balanceStr);
  }

  async mint() {
    const nftCount: number = await this.nftCount();

    if (nftCount !== 0) return null;

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

    if (!gifts.length) return 0;

    await postGiftOpen({ client: this.client, id: gifts[0].id });

    return gifts.length;
  }

  async questions(quizId: string) {
    let answeredCount = 0;

    const quizAnswers = answers[quizId];

    if (!quizAnswers) return answeredCount;

    const quiz = await getQuiz({ client: this.client, id: quizId });

    logger.info(`${this.name} | solving ${quiz.title} quiz`);

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

      await sleep(5, 10);
    }

    return answeredCount;
  }

  async quizes() {
    let answeredCount = 0;

    const quizes = await getQuizes({ client: this.client });

    for (const quiz of quizes) {
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
    logger.info(`${this.name} | start`);

    await this.login();
    logger.info(`${this.name} | login success`);
    await sleep(5, 10);

    const hash = await this.mint();

    if (hash) {
      logger.info(
        `${this.name} | passport mint success https://bscscan.com/tx/${hash}`,
      );
      await sleep(5, 10);
    }

    const openedGiftsCount = await this.giftOpen();
    logger.info(`${this.name} | opened ${openedGiftsCount} gifts`);
    await sleep(5, 10);

    const answeredCount = await this.quizes();
    logger.info(`${this.name} | answered ${answeredCount} questions`);
    await sleep(5, 10);

    const isChecked = await this.checkIn();
    logger.info(`${this.name} | check status: ${isChecked}`);
    await sleep(5, 10);

    const totalGoldLeaves = await this.goldLeaves();
    logger.info(`${this.name} | current leave count: ${totalGoldLeaves}`);
    await sleep(5, 10);

    return { totalGoldLeaves };
  }
}

export default Worker;
