import { ethers } from "ethers";
import { addHours, differenceInSeconds, subHours } from "date-fns";
import { randomInt } from "@alfar/helpers";
import { startOfNextUTCDay, endOfNextUTCDay } from "./date";

type Item = {
  name: string;
  index: number;
  wallet: ethers.Wallet;
  nextRunTime: number;
};

class Queue {
  public readonly items: Item[];

  public constructor(
    wallets: { wallet: ethers.Wallet; index: number }[],
    endTime: number,
  ) {
    this.items = [];

    const now = new Date().getTime() + 2 * 60 * 1000;

    for (const wallet of wallets) {
      this.items.push(
        Queue.createItem(wallet.wallet, wallet.index, now, endTime),
      );
    }

    this.sort();
  }

  protected static createItem(
    wallet: ethers.Wallet,
    index: number,
    startTime: number,
    endTime: number,
  ) {
    const nameStart = wallet.address.substring(0, 6);
    const nameEnd = wallet.address.substring(wallet.address.length - 4);
    const name = `${nameStart}...${nameEnd}`;

    const nextRunTime = randomInt(startTime, endTime);
    const item: Item = { name, index, wallet, nextRunTime };
    return item;
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

  public push(wallet: ethers.Wallet, index: number) {
    const safeHours = 2;

    const startTime = addHours(startOfNextUTCDay(), safeHours).getTime();
    const endTime = subHours(endOfNextUTCDay(), safeHours).getTime();

    const item = Queue.createItem(wallet, index, startTime, endTime);

    this.items.push(item);

    this.sort();

    const nextRunSec = differenceInSeconds(item.nextRunTime, new Date());

    return nextRunSec;
  }
}

export default Queue;
