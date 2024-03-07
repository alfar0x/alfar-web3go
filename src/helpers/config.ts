import { z } from "zod";
import { IniConfig, iniNumberSchema } from "@alfar/helpers";
import { FILE_CONFIG } from "./constants";
import { logger } from "./common";

const fixedSchema = z
  .object({
    common: z.object({
      rpc: z.string().url(),
      isRandomProxy: z.boolean(),
    }),
    collectAll: z.object({
      minutesBeforeStart: iniNumberSchema,
      minSleepSecOnInit: iniNumberSchema,
      maxSleepSecOnInit: iniNumberSchema,
    }),
  })
  .strict();

const dynamicSchema = z
  .object({
    collectAll: z.object({
      isNewTaskAfterFinish: z.boolean(),
      errorWaitSec: iniNumberSchema,
      errorRetryTimes: iniNumberSchema,
    }),
  })
  .strict();

const config = new IniConfig({
  fileName: FILE_CONFIG,
  fixedSchema,
  dynamicSchema: dynamicSchema,
  onDynamicError: logger.error,
  defaultValues: {
    fixed: {
      common: {
        rpc: "https://rpc.ankr.com/bsc",
        isRandomProxy: true,
      },
      collectAll: {
        minutesBeforeStart: 0,
        minSleepSecOnInit: 10,
        maxSleepSecOnInit: 30,
      },
    },
    dynamic: {
      collectAll: {
        isNewTaskAfterFinish: true,
        errorWaitSec: 10,
        errorRetryTimes: 3,
      },
    },
  },
});

export default config;
