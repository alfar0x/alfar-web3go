import axios from "axios";

import { HttpsProxyAgent } from "https-proxy-agent";
import { SocksProxyAgent } from "socks-proxy-agent";
import axiosRetry from "axios-retry";
import { readByLine } from "./file";
import { randomChoice } from "./random";
import logger from "./logger";

axiosRetry(axios, {
  retries: 10,
  shouldResetTimeout: true,
  retryDelay: () => 2 * 60 * 1000,
  onRetry: (retryCount, error) => {
    logger.error(`error ${error.message}. Retrying ${retryCount}`);
  },
});

type ProxyItem = {
  type: "http" | "socks";
  host: string;
  port: number;
  username: string;
  password: string;
};

const getAgent = (proxy?: ProxyItem) => {
  if (!proxy) return undefined;

  const { type, host, port, username, password } = proxy;

  switch (type) {
    case "http": {
      return new HttpsProxyAgent(
        `http://${username}:${password}@${host}:${port}`,
      );
    }
    case "socks": {
      return new SocksProxyAgent(
        `socks://${username}:${password}@${host}:${port}`,
      );
    }
    default: {
      throw new Error(`proxy type is not allowed ${type}`);
    }
  }
};

const getClient = (params: { proxy?: ProxyItem }) => {
  const { proxy } = params;
  const userAgent = randomChoice(readByLine("assets/user-agents.txt"));

  const agent = getAgent(proxy);

  return axios.create({
    timeout: 60000,
    headers: {
      accept: "application/json, text/plain, */*",
      "accept-language": "en-US",
      "Cache-Control": "max-age=0",
      Connection: "keep-alive",
      "user-agent": userAgent,
    },
    baseURL: `https://reiki.web3go.xyz/api`,
    httpAgent: agent,
    httpsAgent: agent,
    responseType: "json",
  });
};

export default getClient;
