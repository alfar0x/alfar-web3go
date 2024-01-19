import {
  FILE_CONFIG,
  FILE_PRIVATE_KEYS,
  FILE_PROXIES,
  FILE_TABLE,
} from "../helpers/constants";
import initializeFiles from "../helpers/initialize-files";
import { initializeConfig } from "../helpers/config";

const initialize = () => {
  initializeFiles([FILE_TABLE, FILE_PRIVATE_KEYS, FILE_PROXIES, FILE_CONFIG]);
  initializeConfig();
};

initialize();
