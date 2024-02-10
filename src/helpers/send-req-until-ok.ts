import axios, { AxiosRequestConfig } from "axios";
import { sleep } from "@alfar/helpers";
import { logger } from "./common";

const sendReqUntilOk = async (
  url: string,
  config?: AxiosRequestConfig<any>,
) => {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const response = await axios(url, config);

      if (response.status === 200) return true;

      throw new Error(`Request failed with status: ${response.status}`);
    } catch (error) {
      logger.error((error as Error).message);

      await sleep(15);
    }
  }
};

export default sendReqUntilOk;