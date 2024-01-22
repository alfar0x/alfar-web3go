import { ProxyItem, getProxyAgent, randomUserAgent } from "@alfar/helpers";
import axiosRetry from "axios-retry";
import axios from "axios";
import { logger } from "./common";

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

  axiosRetry(client, {
    retries: 3,
    shouldResetTimeout: true,
    retryDelay: () => 2 * 60 * 1000,
    onRetry: (retryCount, error) => {
      logger.error(`error ${error.message}. Retrying ${retryCount}`);
    },
  });

  return client;
};
