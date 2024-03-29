import { Axios } from "axios";
import { subDays, addDays, format } from "date-fns";
import {
  challengeSchema,
  checkInsStreakSchema,
  giftsSchema,
  goldLeavesSchema,
  lotteryOffchainSchema,
  lotteryTrySchema,
  nonceSchema,
  quizSchema,
  quizesSchema,
  recentCheckInsSchema,
} from "./schemas";

export const postNonce = async (params: { client: Axios; address: string }) => {
  const { client, address } = params;

  const { data } = await client.post("/account/web3/web3_nonce", { address });

  return nonceSchema.parse(data);
};

export const postChallenge = async (params: {
  client: Axios;
  address: string;
  challenge: string;
  nonce: number | string;
  signature: string;
}) => {
  const { client, address, challenge, nonce, signature } = params;

  const { data } = await client.post("/account/web3/web3_challenge", {
    address,
    challenge,
    nonce,
    signature,
  });

  return challengeSchema.parse(data);
};

export const putCheckIn = async (params: { client: Axios }) => {
  const { client } = params;

  const day = format(new Date(), "yyyy-MM-dd");

  await client.put(`/checkin?day=${day}`);
};

export const getNftSync = async (params: { client: Axios }) => {
  const { client } = params;

  await client.get("/nft/sync");
};

export const getGifts = async (params: { client: Axios }) => {
  const { client } = params;

  const { data } = await client.get("/gift?type=recent");

  return giftsSchema.parse(data);
};

export const postGiftOpen = async (params: { client: Axios; id: string }) => {
  const { client, id } = params;

  await client.post(`/gift/open/${id}`);
};

export const getQuizes = async (params: { client: Axios }) => {
  const { client } = params;

  const { data } = await client.get("/quiz");

  return quizesSchema.parse(data);
};

export const getQuiz = async (params: { client: Axios; id: string }) => {
  const { client, id } = params;

  const { data } = await client.get(`/quiz/${id}`);

  return quizSchema.parse(data);
};

export const postQuizAnswer = async (params: {
  client: Axios;
  id: string;
  answers: string[];
}) => {
  const { client, id, answers } = params;

  await client.post(`/quiz/${id}/answer`, { answers });
};

export const getGoldLeaves = async (params: { client: Axios }) => {
  const { client } = params;

  const { data } = await client.get(`/GoldLeaf/me`);

  return goldLeavesSchema.parse(data);
};

export const getRecentCheckIns = async (params: { client: Axios }) => {
  const start = format(subDays(new Date(), 2), "yyyyMMdd");
  const end = format(addDays(new Date(), 4), "yyyyMMdd");

  const { client } = params;

  const { data } = await client.get(
    `/checkin/points/his?start=${start}&end=${end}`,
  );

  return recentCheckInsSchema.parse(data);
};

export const getCheckInStreakDays = async (params: { client: Axios }) => {
  const day = format(new Date(), "yyyyMMdd");

  const { client } = params;

  const { data } = await client.get(`/checkin/streakdays?day=${day}`);

  return checkInsStreakSchema.parse(data);
};

export const postLotteryTry = async (params: { client: Axios }) => {
  const { client } = params;

  const { data } = await client.post(`/lottery/try`);

  return lotteryTrySchema.parse(data);
};

export const getLotteryOffchain = async (params: { client: Axios }) => {
  const { client } = params;

  const { data } = await client.get(`/lottery/offchain`);

  return lotteryOffchainSchema.parse(data);
};
