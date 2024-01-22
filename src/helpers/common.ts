import {
  IniConfig,
  ProxyItem,
  evmPrivateKeySchema,
  formatRel,
  formatShortString,
  getProxyAgent,
  iniNumberSchema,
  initDefaultLogger,
  parseProxy,
  randomInt,
  randomUserAgent,
  readByLine,
  sleep,
} from "@alfar/helpers";
import axiosRetry from "axios-retry";
import axios from "axios";
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

axiosRetry(axios, {
  retries: 10,
  shouldResetTimeout: true,
  retryDelay: () => 2 * 60 * 1000,
  onRetry: (retryCount, error) => {
    logger.error(`error ${error.message}. Retrying ${retryCount}`);
  },
});

export const getClient = (params: { proxy?: ProxyItem }) => {
  const { proxy } = params;

  const agent = getProxyAgent(proxy);

  const client = axios.create({
    timeout: 60000,
    headers: {
      accept: "application/json, text/plain, */*",
      "accept-language": "en-US",
      "Cache-Control": "max-age=0",
      Connection: "keep-alive",
      "user-agent": randomUserAgent(),
    },
    baseURL: `https://reiki.web3go.xyz/api`,
    httpAgent: agent,
    httpsAgent: agent,
    responseType: "json",
  });

  client.interceptors.request.use(
    (config) => {
      try {
        const str = JSON.stringify(
          { data: config.data, params: config.params, url: config.url },
          null,
          2,
        );
        logger.debug(`Request: ${str}`);
      } catch (error: any) {
        logger.debug(
          `Request config debug error (${config.url}) ${error?.message}`,
        );
      }

      return config;
    },
    (error) => {
      try {
        const str = JSON.stringify(error, null, 2);
        logger.debug(`Request error: ${str}`);
      } catch (error: any) {
        logger.debug(`Request error debug error ${error?.message}`);
      }

      return Promise.reject(error);
    },
  );

  client.interceptors.response.use(
    (response) => {
      try {
        const str = JSON.stringify(
          { data: response.data, url: response?.config?.url },
          null,
          2,
        );
        logger.debug(`Response: ${str}`);
      } catch (error: any) {
        logger.debug(
          `Response config debug error (${response?.config?.url}) ${error?.message}`,
        );
      }

      return response;
    },
    (error) => {
      try {
        const str = JSON.stringify(error, null, 2);
        logger.debug(`Response error: ${str}`);
      } catch (error: any) {
        logger.debug(`Response error debug error ${error?.message}`);
      }

      return Promise.reject(error);
    },
  );

  return client;
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
