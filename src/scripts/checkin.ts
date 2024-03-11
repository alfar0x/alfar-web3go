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
  FILE_CHECK_IN_TABLE,
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
  if (config.fixed.checkin.minutesBeforeStart === "tomorrow") {
    const secBeforeStart = differenceInSeconds(
      addMinutes(startOfTomorrow(), randomInt(180, 240)),
      new Date(),
    );

    await wait(secBeforeStart);
  } else if (config.fixed.checkin.minutesBeforeStart >= 0) {
    await wait(Math.round(config.fixed.checkin.minutesBeforeStart * 60));
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
    FILE_CHECK_IN_TABLE,
    wallets.map((w) => w.wallet.address),
  );

  const queue = new Queue(
    shuffle(wallets),
    config.fixed.checkin.minSleepSecOnInit,
    config.fixed.checkin.maxSleepSecOnInit,
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
      const { totalGoldLeaves, checkInStreak } = await worker.collect();

      updateAddressData(
        FILE_CHECK_IN_TABLE,
        wallet.address,
        checkInStreak,
        totalGoldLeaves,
      );
    } catch (error) {
      logger.error(`${wallet.address} | ${(error as Error)?.message}`);
      await wait(10);
    }

    if (proxy.changeUrl) {
      await sendReqUntilOk(proxy.changeUrl);
      logger.info("ip changed");
    }

    if (config.fixed.checkin.isNewTaskAfterFinish) {
      const nextRunSec = queue.push(queueItem);
      logger.info(`${name} | next run ${formatRel(nextRunSec)}`);
    }
  }

  logger.info("done");
};

main().catch((error) => logger.error(error.message));
