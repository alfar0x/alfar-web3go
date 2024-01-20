import { createFiles } from "@alfar/helpers";
import {
  FILE_CONFIG,
  FILE_PRIVATE_KEYS,
  FILE_PROXIES,
  FILE_TABLE,
} from "../helpers/constants";
import { config } from "../helpers/common";

const initialize = () => {
  createFiles([FILE_TABLE, FILE_PRIVATE_KEYS, FILE_PROXIES, FILE_CONFIG]);
  config.resetFile();
};

initialize();
