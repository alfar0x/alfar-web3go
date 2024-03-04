import {
  evmPrivateKeySchema,
  formatRel,
  formatShortString,
  initDefaultLogger,
  parseProxy,
  randomInt,
  readByLine,
  sleep,
} from "@alfar/helpers";
import { addHours, minutesToMilliseconds } from "date-fns";
import { ethers } from "ethers";
import { FILE_PRIVATE_KEYS, FILE_PROXIES } from "./constants";

export const logger = initDefaultLogger();

export const wait = async (minSec: number, maxSec?: number) => {
  const sec = maxSec ? randomInt(minSec, maxSec) : minSec;
  if (sec > 60) {
    logger.info(`sleeping until ${formatRel(sec)}`);
  }
  await sleep(sec);
};

export const getProxies = async () => {
  let retry = 5;

  while (retry) {
    try {
      const data = readByLine(FILE_PROXIES);

      if (!data.length) throw new Error("proxies is required!");

      try {
        return data.map((p) => parseProxy(p));
      } catch (error: any) {
        throw new Error(`proxy error: ${error?.message}`);
      }
    } catch (error: any) {
      if (!retry) throw error;
      logger.error(`proxy error: ${error?.message}`);
      retry -= 1;
      await sleep(15);
    }
  }

  throw new Error("proxy retry count 0");
};

export const getWallets = (provider: ethers.providers.JsonRpcProvider) => {
  return readByLine(FILE_PRIVATE_KEYS)
    .filter(Boolean)
    .map((item, index) => {
      const [prKey, name] = item.trim().split(";");

      const parsedPrivateKey = evmPrivateKeySchema.parse(prKey);

      const wallet = new ethers.Wallet(parsedPrivateKey, provider);

      if (name) return { index, wallet, name };

      const addressName = formatShortString(wallet.address, 6, 4);

      return { index, wallet, name: addressName };
    });
};

export const startOfNextUTCDay = () => {
  const currentLocalTime = new Date();

  const timezoneOffsetMs = minutesToMilliseconds(
    currentLocalTime.getTimezoneOffset(),
  );

  const startOfNextDayLocal = new Date(currentLocalTime);

  startOfNextDayLocal.setHours(0, 0, 0, 0);
  startOfNextDayLocal.setDate(startOfNextDayLocal.getDate() + 1);

  const startOfNextDayUTC = new Date(
    startOfNextDayLocal.getTime() - timezoneOffsetMs,
  );

  const timestampNextDayUTC = startOfNextDayUTC.getTime();

  return timestampNextDayUTC;
};

export const endOfNextUTCDay = () => {
  const start = startOfNextUTCDay();
  return addHours(start, 24).getTime();
};
