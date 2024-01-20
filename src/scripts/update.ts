import { createFiles } from "@alfar/helpers";
import {
  FILE_CONFIG,
  FILE_PRIVATE_KEYS,
  FILE_PROXIES,
  FILE_TABLE,
} from "../helpers/constants";
import { config } from "../helpers/common";

const update = () => {
  createFiles([FILE_TABLE, FILE_PRIVATE_KEYS, FILE_PROXIES, FILE_CONFIG]);
  try {
    config.resetFile();
  } catch (e) {
    /* empty */
  }
};

update();
