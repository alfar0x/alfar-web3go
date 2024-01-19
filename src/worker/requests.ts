import { Axios } from "axios";
import { format } from "date-fns";
import {
  challengeSchema,
  giftsSchema,
  goldLeavesSchema,
  nonceSchema,
  quizSchema,
  quizesSchema,
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
  nonce: number;
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

  await client.put("/checkIn", {
    searchParams: { day: format(new Date(), "YYYY-MM-DD") },
  });
};

export const getNftSync = async (params: { client: Axios }) => {
  const { client } = params;

  await client.get("/nft/sync");
};

export const getGifts = async (params: { client: Axios }) => {
  const { client } = params;

  const { data } = await client.get("/gift", {
    params: { type: "recent" },
  });

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
