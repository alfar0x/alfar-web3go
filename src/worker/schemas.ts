import { parse } from "date-fns";
import { z } from "zod";

export const nonceSchema = z.object({ nonce: z.string() });

export const challengeSchema = z.object({
  // address: z.string(),
  // chain: z.string(),
  // challenge: z.string(),
  extra: z.object({
    // account: z.string(),
    // authFrom: z.string(),
    token: z.string(),
  }),
  // nonce: z.string(),
  // signature: z.string(),
  // verified: z.boolean(),
});

export const giftsSchema = z.array(z.object({ id: z.string() }));

export const quizesSchema = z.array(
  z.object({
    id: z.string(),
    totalItemCount: z.number(),
    currentProgress: z.number(),
    // title: z.string(),
    // description: z.string(),
    // rewardPoints: z.number(),
    // extraRewards: z.string().nullable(),
    // checkRuleLink: z.string(),
    // rewardDescription: z.string(),
    // countdownThreshold: z.number(),
    // startsAt: z.string(),
    // endsAt: z.string(),
  }),
);

// const quizOptionSchema = z.object({
//   A: z.string(),
//   B: z.string(),
//   C: z.string(),
//   D: z.string().optional(),
// });

const quizItemSchema = z.object({
  id: z.string(),
  sortIndex: z.number(),
  answers: z.array(z.string()).optional(),
  // question: z.string(),
  // options: quizOptionSchema,
  // type: z.string(),
  // answerCount: z.number(),
});

export const quizSchema = z.object({
  id: z.string(),
  items: z.array(quizItemSchema),
  title: z.string(),
  // topic: z.string(),
  // description: z.string(),
  // show: z.boolean(),
  // status: z.string(),
  // rewardPoints: z.number(),
  // extraRewards: z.string(),
  // checkRuleLink: z.string(),
  // countdownThreshold: z.number(),
  // rewardDescription: z.string(),
  // startsAt: z.string(),
  // endsAt: z.string(),
  // createdAt: z.string(),
  // updatedAt: z.string(),
  // deletedAt: z.string().nullable(),
  // lumiLink: z.string(),
  // currentProgress: z.number(),
  // totalItemCount: z.number(),
});

export const goldLeavesSchema = z.object({
  total: z.number(),
  // today: z.number(),
});

export const recentCheckInsSchema = z.array(
  z.object({
    date: z.string().transform((str) => new Date(str)),
    status: z.union([
      z.literal("checked"),
      z.literal("missed"),
      z.literal("pending"),
    ]),
    gainedPoints: z.number(),
    pointsIfChecked: z.number(),
  }),
);
