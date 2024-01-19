import * as ini from "ini";
import { z } from "zod";
import { readFile, writeFile } from "./file";
import { FILE_CONFIG } from "./constants";
import { formatDate } from "./date";

const ipOrDomainPattern =
  /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(?:(?!-)[A-Za-z0-9-]{1,63}(?<!-)\.?)+(?:[A-Za-z]{2,6})$/;

const iniNumberSchema = z
  .string()
  .regex(/\d+/, "Must be a number")
  .transform((str) => Number(str));

const configSchema = z.object({
  global: z.object({
    rpc: z.string().url(),
    minutesToInitializeAll: iniNumberSchema,
    isNewTaskAfterFinish: z.boolean(),
    rerunTodayOnErrorCountLess: z.number(),
  }),
  proxy: z.object({
    type: z.union([z.literal("http"), z.literal("socks")]),
    host: z.string().refine((value) => ipOrDomainPattern.test(value), {
      message: "Invalid IP or domain format",
    }),
    port: iniNumberSchema,
    username: z.string(),
    password: z.string(),
    changeUrl: z.string().url().or(z.string().length(0)),
  }),
});

const getConfig = () => {
  const iniContent = readFile(FILE_CONFIG);
  const parsedIni = ini.parse(iniContent);

  return configSchema.parse(parsedIni);
};

export const initializeConfig = () => {
  const config: z.infer<typeof configSchema> = {
    global: {
      rpc: "https://rpc.ankr.com/bsc",
      minutesToInitializeAll: 1440,
      isNewTaskAfterFinish: true,
      rerunTodayOnErrorCountLess: 1,
    },
    proxy: {
      type: "http",
      host: "11.11.11.11",
      port: 8000,
      username: "user",
      password: "password",
      changeUrl: "",
    },
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
