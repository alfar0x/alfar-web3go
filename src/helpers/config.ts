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
      minutesToInitializeAll: iniNumberSchema,
    }),
  })
  .strict();

const dynamicSchema = z
  .object({
    collectAll: z.object({
      isNewTaskAfterFinish: z.boolean(),
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
        minutesToInitializeAll: 1440,
      },
    },
    dynamic: {
      collectAll: {
        isNewTaskAfterFinish: true,
      },
    },
  },
  disableInitialize: true,
});

export default config;
