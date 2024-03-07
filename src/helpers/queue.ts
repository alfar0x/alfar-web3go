import { Wallet } from "ethers";
import { addHours, differenceInSeconds, subHours } from "date-fns";
import { randomInt } from "@alfar/helpers";
import { startOfNextUTCDay, endOfNextUTCDay } from "./common";

type RawItem = {
  name: string;
  index: number;
  wallet: Wallet;
};

type Item = {
  name: string;
  index: number;
  wallet: Wallet;
  nextRunTime: number;
};

class Queue {
  public readonly items: Item[];

  public constructor(
    items: RawItem[],
    minSleepSec: number,
    maxSleepSec: number,
  ) {
    this.items = [];

    let prevTime = new Date().getTime() + 10 * 1000;

    for (const item of items) {
      const { name, wallet, index } = item;
      const sleepSec = randomInt(minSleepSec, maxSleepSec);
      const nextRunTime = prevTime + sleepSec * 1000;
      this.items.push({ name, wallet, index, nextRunTime });

      prevTime += nextRunTime;
    }

    this.sort();
  }

  public sort() {
    this.items.sort((a, b) => a.nextRunTime - b.nextRunTime);
  }

  public next() {
    if (this.isEmpty()) return null;

    return this.items.shift() as Item;
  }

  public isEmpty() {
    return this.items.length === 0;
  }

  public push(rawItem: RawItem) {
    const { name, wallet, index } = rawItem;

    const safeHours = 2;
    const startTime = addHours(startOfNextUTCDay(), safeHours).getTime();
    const endTime = subHours(endOfNextUTCDay(), safeHours).getTime();
    const nextRunTime = randomInt(startTime, endTime);

    this.items.push({ name, wallet, index, nextRunTime });

    this.sort();

    const nextRunSec = differenceInSeconds(nextRunTime, new Date());

    return nextRunSec;
  }
}

export default Queue;
