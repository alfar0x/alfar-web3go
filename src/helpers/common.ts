import {
  addSeconds,
  differenceInMinutes,
  formatDistanceToNowStrict,
  formatRelative,
} from "date-fns";
import logger from "./logger";
import { randomInt } from "./random";

export const replaceAll = (
  str: string,
  replacers: Array<{ search: string; replace: string }>,
) => {
  return replacers.reduce(
    (s, { search, replace }) => s.replaceAll(search, replace),
    str,
  );
};

const distanceReplacers = [
  { search: " seconds", replace: "s" },
  { search: " minutes", replace: "m" },
  { search: " hours", replace: "h" },
  { search: " days", replace: "d" },
  { search: " months", replace: "mth" },
  { search: " years", replace: "y" },
  { search: " second", replace: "s" },
  { search: " minute", replace: "m" },
  { search: " hour", replace: "h" },
  { search: " day", replace: "d" },
  { search: " month", replace: "mth" },
  { search: " year", replace: "y" },
];

export const formatRel = (sec: number) => {
  const time = addSeconds(new Date(), sec);

  const relative = formatRelative(time, new Date());

  const relFormatted =
    differenceInMinutes(time, new Date()) > 24 * 60
      ? relative
      : relative.replace("today at ", "").replace("tomorrow at ", "");

  const distance = replaceAll(
    formatDistanceToNowStrict(time),
    distanceReplacers,
  );

  return `${relFormatted} (${distance})`;
};

export const sleep = async (minSec: number, maxSec?: number) => {
  const sec = maxSec ? randomInt(minSec, maxSec) : minSec;
  logger.info(`sleeping until ${formatRel(sec)}`);
  await new Promise((resolve) => setTimeout(resolve, Math.round(sec * 1000)));
};
