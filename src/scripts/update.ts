import { createFiles } from "@alfar/helpers";
import {
  FILE_CONFIG,
  FILE_PRIVATE_KEYS,
  FILE_PROXIES,
  FILE_CHECK_IN_TABLE,
  FILE_LOTTERY_TABLE,
  FILE_REGISTER_TABLE,
} from "../helpers/constants";
import { logger } from "../helpers/common";
import config from "../helpers/config";

const update = () => {
  createFiles([
    FILE_CHECK_IN_TABLE,
    FILE_LOTTERY_TABLE,
    FILE_REGISTER_TABLE,
    FILE_PRIVATE_KEYS,
    FILE_PROXIES,
    FILE_CONFIG,
  ]);

  if (!config.checkIsFileValid()) {
    config.resetFile();
    logger.warn(`${FILE_CONFIG} was updated`);
  }
};

update();
