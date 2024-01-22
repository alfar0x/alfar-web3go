import {
  IniConfig,
  evmPrivateKeySchema,
  formatRel,
  formatShortString,
  iniNumberSchema,
  initDefaultLogger,
  parseProxy,
  randomInt,
  readByLine,
  sleep,
} from "@alfar/helpers";
import { addHours, minutesToMilliseconds } from "date-fns";
import { z } from "zod";
import { ethers } from "ethers";
import { FILE_CONFIG, FILE_PRIVATE_KEYS, FILE_PROXIES } from "./constants";

export const logger = initDefaultLogger();

export const wait = async (minSec: number, maxSec?: number) => {
  const sec = maxSec ? randomInt(minSec, maxSec) : minSec;
  logger.info(`sleeping until ${formatRel(sec)}`);
  await sleep(sec);
};

export const getProxies = () =>
  readByLine(FILE_PROXIES).map((p) => parseProxy(p));

export const getWallets = (provider: ethers.providers.JsonRpcProvider) => {
  return readByLine(FILE_PRIVATE_KEYS).map((item, index) => {
    const [prKey, name] = item.split(";");

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

const fixedSchema = z
  .object({
    common: z.object({
      rpc: z.string().url(),
      isRandomProxy: z.boolean(),
    }),
    collectAll: z.object({
      minutesToInitializeAll: iniNumberSchema,
      isNewTaskAfterFinish: z.boolean(),
    }),
  })
  .strict();

export const config = new IniConfig({
  fileName: FILE_CONFIG,
  fixedSchema,
  dynamicSchema: z.object({}),
  onDynamicError: logger.error,
  defaultValues: {
    fixed: {
      common: {
        rpc: "https://rpc.ankr.com/bsc",
        isRandomProxy: true,
      },
      collectAll: {
        minutesToInitializeAll: 1440,
        isNewTaskAfterFinish: true,
      },
    },
    dynamic: {},
  },
});
