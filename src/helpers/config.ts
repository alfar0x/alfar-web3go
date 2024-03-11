import { z } from "zod";
import { IniConfig, iniNumberSchema } from "@alfar/helpers";
import { FILE_CONFIG } from "./constants";
import { logger } from "./common";

const fixedSchema = z
  .object({
    common: z.object({
      rpc: z.string().url(),
      isRandomProxy: z.boolean(),
      errorWaitSec: iniNumberSchema,
      errorRetryTimes: iniNumberSchema,
    }),
    register: z.object({
      minutesBeforeStart: iniNumberSchema.or(z.literal("tomorrow")),
      minSleepSecOnInit: iniNumberSchema,
      maxSleepSecOnInit: iniNumberSchema,
      isNewTaskAfterFinish: z.boolean(),
    }),
    checkin: z.object({
      minutesBeforeStart: iniNumberSchema.or(z.literal("tomorrow")),
      minSleepSecOnInit: iniNumberSchema,
      maxSleepSecOnInit: iniNumberSchema,
      isNewTaskAfterFinish: z.boolean(),
    }),
    lottery: z.object({
      minutesBeforeStart: iniNumberSchema.or(z.literal("tomorrow")),
      minSleepSec: iniNumberSchema,
      maxSleepSec: iniNumberSchema,
    }),
  })
  .strict();

const dynamicSchema = z.object({}).strict();

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
        errorWaitSec: 10,
        errorRetryTimes: 3,
      },
      register: {
        minutesBeforeStart: 0,
        minSleepSecOnInit: 10,
        maxSleepSecOnInit: 30,
        isNewTaskAfterFinish: true,
      },
      checkin: {
        minutesBeforeStart: 0,
        minSleepSecOnInit: 10,
        maxSleepSecOnInit: 30,
        isNewTaskAfterFinish: true,
      },
      lottery: {
        minutesBeforeStart: 0,
        minSleepSec: 15,
        maxSleepSec: 60,
      },
    },
    dynamic: {},
  },
});

export default config;
