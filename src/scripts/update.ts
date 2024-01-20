import { createFiles } from "@alfar/helpers";
import {
  FILE_CONFIG,
  FILE_PRIVATE_KEYS,
  FILE_PROXIES,
  FILE_TABLE,
} from "../helpers/constants";
import { config, logger } from "../helpers/common";

const update = () => {
  createFiles([FILE_TABLE, FILE_PRIVATE_KEYS, FILE_PROXIES, FILE_CONFIG]);

  try {
    const isReset = config.resetFile();
    if (isReset) logger.warn(`${FILE_CONFIG} was updated`);
  } catch (e) {
    /* empty */
  }
};

update();
