import * as ini from "ini";
import { z } from "zod";
import { readFile, writeFile } from "./file";
import { FILE_CONFIG } from "./constants";
import { formatDate } from "./date";

const iniNumberSchema = z
  .string()
  .regex(/\d+/, "Must be a number")
  .transform((str) => Number(str));

const configSchema = z
  .object({
    rpc: z.string().url(),
    minutesToInitializeAll: iniNumberSchema,
    isNewTaskAfterFinish: z.boolean(),
    isRandomProxy: z.boolean(),
  })
  .strict();

const getConfig = () => {
  const iniContent = readFile(FILE_CONFIG);
  const parsedIni = ini.parse(iniContent);

  return configSchema.parse(parsedIni);
};

export const initializeConfig = () => {
  const config: z.infer<typeof configSchema> = {
    rpc: "https://rpc.ankr.com/bsc",
    minutesToInitializeAll: 1440,
    isNewTaskAfterFinish: true,
    isRandomProxy: true,
  };

  writeFile(FILE_CONFIG, ini.stringify(config));
};

export const checkIsConfigValid = () => {
  const iniContent = readFile(FILE_CONFIG);
  const parsedIni = ini.parse(iniContent);

  return configSchema.safeParse(parsedIni).success;
};

export const updateConfig = () => {
  if (checkIsConfigValid()) return;

  const configBackup = readFile(FILE_CONFIG);
  const now = formatDate(new Date(), "yy-MM-dd_hh-mm-ss");
  writeFile(`./input/${now}-config-backup.ini`, configBackup);
  initializeConfig();
};

export default getConfig;
