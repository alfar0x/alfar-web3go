// eslint-disable-next-line import/order
import config from "../helpers/config";

config.initialize();

import { ethers } from "ethers";
import axios from "axios";
import { addMinutes, differenceInSeconds, startOfTomorrow } from "date-fns";
import {
  formatRel,
  randomChoice,
  randomInt,
  readFile,
  shuffle,
} from "@alfar/helpers";

import axiosRetry from "axios-retry";
import {
  CONTRACT_ADDRESS,
  FILE_LOTTERY_TABLE,
  MIN_SLEEP_BETWEEN_ACCS_SEC,
} from "../helpers/constants";
import Worker from "../worker";
import Queue from "../helpers/queue";
import { initTable, updateAddressData } from "../helpers/table";
import { getProxies, logger, wait, getWallets } from "../helpers/common";
import { getClient } from "../helpers/get-client";
import sendReqUntilOk from "../helpers/send-req-until-ok";

axiosRetry(axios, {
  retries: 3,
  shouldResetTimeout: true,
  retryDelay: () => 2 * 60 * 1000,
  onRetry: (retryCount, error) => {
    logger.error(`error ${error.message}. Retrying ${retryCount}`);
  },
  retryCondition: () => true,
});

const main = async () => {
  if (config.fixed.lottery.minutesBeforeStart === "tomorrow") {
    const secBeforeStart = differenceInSeconds(
      addMinutes(startOfTomorrow(), randomInt(180, 240)),
      new Date(),
    );

    await wait(secBeforeStart);
  } else if (config.fixed.lottery.minutesBeforeStart >= 0) {
    await wait(Math.round(config.fixed.lottery.minutesBeforeStart * 60));
  }

  const abi = readFile("./assets/abi.json");

  const provider = new ethers.providers.JsonRpcProvider({
    url: config.fixed.common.rpc,
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    skipFetchSetup: true,
    timeout: 10000,
  });

  const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

  const wallets = getWallets(provider);

  initTable(
    FILE_LOTTERY_TABLE,
    wallets.map((w) => w.wallet.address),
  );

  const queue = new Queue(
    shuffle(wallets),
    config.fixed.lottery.minSleepSec,
    config.fixed.lottery.maxSleepSec,
  );

  const lastRunTime = queue.lastRunTime();
  const secondsToInit = differenceInSeconds(lastRunTime, new Date());

  logger.info(
    `approx all wallets (${wallets.length}) will be initialized ${formatRel(secondsToInit)}`,
  );

  let isFirstIteration = true;

  while (!queue.isEmpty()) {
    const queueItem = queue.next();

    if (!queueItem) break;

    if (!isFirstIteration) {
      const pauseSec = Math.max(
        differenceInSeconds(queueItem.nextRunTime, new Date()),
        MIN_SLEEP_BETWEEN_ACCS_SEC,
      );

      await wait(pauseSec);
    }

    isFirstIteration = false;

    const { name, wallet, index } = queueItem;

    const proxies = await getProxies();

    if (
      !config.fixed.common.isRandomProxy &&
      wallets.length !== proxies.length
    ) {
      throw new Error(
        `private keys count must be equals to proxies count if isRandomProxy=false`,
      );
    }

    const proxy = config.fixed.common.isRandomProxy
      ? randomChoice(proxies)
      : proxies[index];

    try {
      const client = getClient({
        proxy,
        errorRetryTimes: config.fixed.common.errorRetryTimes,
        errorWaitSec: config.fixed.common.errorWaitSec,
      });

      const worker = new Worker({ name, client, wallet, contract });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { userGoldLeafCount, pieceNum, chipNum } = await worker.lottery();

      updateAddressData(
        FILE_LOTTERY_TABLE,
        wallet.address,
        userGoldLeafCount,
        pieceNum,
        chipNum,
      );
    } catch (error) {
      logger.error(`${wallet.address} | ${(error as Error)?.message}`);
      await wait(10);
    }

    if (proxy.changeUrl) {
      await sendReqUntilOk(proxy.changeUrl);
      logger.info("ip changed");
    }
  }

  logger.info("done");
};

main().catch((error) => logger.error(error.message));
