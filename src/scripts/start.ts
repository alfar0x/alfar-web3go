import { ethers } from "ethers";
import axios from "axios";
import axiosRetry from "axios-retry";
import { addMinutes, differenceInSeconds, minutesToSeconds } from "date-fns";
import { CONTRACT_ADDRESS, FILE_PRIVATE_KEYS } from "../helpers/constants";
import getClient from "../helpers/client";
import Worker from "../worker";
import logger from "../helpers/logger";
import { readByLine, readFile } from "../helpers/file";
import { formatRel, sleep } from "../helpers/common";
import Queue from "../helpers/queue";
import { initTable, updateAddressData } from "../helpers/table";
import getConfig from "../helpers/config";

axiosRetry(axios, {
  retries: 10,
  shouldResetTimeout: true,
  retryDelay: () => 2 * 60 * 1000,
  onRetry: (retryCount, error) => {
    logger.error(`error ${error.message}. Retrying ${retryCount}`);
  },
});

const main = async () => {
  const config = getConfig();

  const privateKeys = readByLine(FILE_PRIVATE_KEYS);

  const abi = readFile("./assets/abi.json");

  const provider = new ethers.providers.JsonRpcProvider({
    url: config.global.rpc,
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    skipFetchSetup: true,
    timeout: 10000,
  });

  const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

  const client = getClient({ proxy: config.proxy });

  const wallets = privateKeys.map((p) => new ethers.Wallet(p, provider));

  const timeToInit = addMinutes(
    new Date(),
    config.global.minutesToInitializeAll,
  ).getTime();

  const queue = new Queue(wallets, timeToInit);

  let queueItem = queue.next();

  if (!queueItem) throw new Error("wallets is empty");

  const secondsToInit = minutesToSeconds(config.global.minutesToInitializeAll);

  initTable(wallets.map((w) => w.address));

  logger.info(`all wallets will be initialized ${formatRel(secondsToInit)}`);

  while (!queue.isEmpty()) {
    const { name, wallet } = queueItem;

    try {
      const worker = new Worker({ name, client, wallet, contract });

      const { totalGoldLeaves } = await worker.run();

      updateAddressData(wallet.address, { totalLeaves: totalGoldLeaves });

      if (config.proxy.changeUrl) await axios.get(config.proxy.changeUrl);
    } catch (error) {
      logger.error(`${name} - ${(error as Error)?.message}`);
      await sleep(10);
    }

    if (!config.global.runOneTimeOnly) {
      const nextCurrentQueueItemData = queue.push(wallet);

      const nextCurrentQueueItemRunSec = differenceInSeconds(
        nextCurrentQueueItemData.nextRunTime,
        new Date(),
      );

      logger.info(
        `${wallet.address} next run ${formatRel(nextCurrentQueueItemRunSec)}`,
      );
    }

    queueItem = queue.next();

    if (!queueItem) break;

    const pauseSec = Math.max(
      differenceInSeconds(queueItem.nextRunTime, new Date()),
      10,
    );

    await sleep(pauseSec);
  }

  logger.info("done");
};

main().catch((error) => logger.error(error.message));
