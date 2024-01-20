import { ethers } from "ethers";
import axios from "axios";
import { addMinutes, differenceInSeconds, minutesToSeconds } from "date-fns";
import { formatRel, randomChoice, readByLine, readFile } from "@alfar/helpers";

import { CONTRACT_ADDRESS, FILE_PRIVATE_KEYS } from "../helpers/constants";
import Worker from "../worker";
import Queue from "../helpers/queue";
import { initTable, updateAddressData } from "../helpers/table";
import { getProxies, config, getClient, logger } from "../helpers/common";

const main = async () => {
  const privateKeys = readByLine(FILE_PRIVATE_KEYS);
  const proxies = getProxies();

  if (!config.fixed.isRandomProxy && privateKeys.length !== proxies.length) {
    throw new Error(
      `private keys count must be equals to proxies count if isRandomProxy=false`,
    );
  }

  const abi = readFile("./assets/abi.json");

  const provider = new ethers.providers.JsonRpcProvider({
    url: config.fixed.rpc,
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    skipFetchSetup: true,
    timeout: 10000,
  });

  const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

  const wallets = privateKeys.map((p, i) => ({
    wallet: new ethers.Wallet(p, provider),
    index: i,
  }));

  const timeToInit = addMinutes(
    new Date(),
    config.fixed.minutesToInitializeAll,
  ).getTime();

  const queue = new Queue(wallets, timeToInit);

  const secondsToInit = minutesToSeconds(config.fixed.minutesToInitializeAll);

  initTable(wallets.map((w) => w.wallet.address));

  logger.info(
    `all wallets (${wallets.length}) will be initialized ${formatRel(secondsToInit)}`,
  );

  let isFirstIteration = true;

  while (!queue.isEmpty()) {
    const queueItem = queue.next();

    if (!queueItem) break;

    if (!isFirstIteration) {
      const pauseSec = Math.max(
        differenceInSeconds(queueItem.nextRunTime, new Date()),
        10,
      );

      await wait(pauseSec);
    }

    isFirstIteration = false;

    const { name, wallet, index } = queueItem;

    const proxy = config.fixed.isRandomProxy
      ? randomChoice(proxies)
      : proxies[index];

    try {
      const client = getClient({ proxy });

      const worker = new Worker({ name, client, wallet, contract });

      const { totalGoldLeaves } = await worker.run();

      updateAddressData(wallet.address, { totalLeaves: totalGoldLeaves });
    } catch (error) {
      logger.error(`${wallet.address} | ${(error as Error)?.message}`);
      await wait(10);
    }

    if (proxy.changeUrl) {
      await axios.get(proxy.changeUrl);
      logger.info("ip changed");
    }

    if (config.fixed.isNewTaskAfterFinish) {
      const nextRunSec = queue.push(wallet, index);
      logger.info(`${name} | next run ${formatRel(nextRunSec)}`);
    }
  }

  logger.info("done");
};

main().catch((error) => logger.error(error.message));
