import { ethers } from "ethers";
import { randomInt } from "./random";
import { endOfNextUTCDay, startOfNextUTCDay } from "./date";

type Item = {
  name: string;
  wallet: ethers.Wallet;
  nextRunTime: number;
};

class Queue {
  public readonly items: Item[];

  public constructor(wallets: ethers.Wallet[], endTime: number) {
    this.items = [];

    const now = new Date().getTime() + 2 * 60 * 1000;

    for (const wallet of wallets) {
      this.items.push(Queue.createItem(wallet, now, endTime));
    }

    this.sort();
  }

  protected static createItem(
    wallet: ethers.Wallet,
    startTime: number,
    endTime: number,
  ) {
    const nameStart = wallet.address.substring(0, 6);
    const nameEnd = wallet.address.substring(wallet.address.length - 4);
    const name = `${nameStart}...${nameEnd}`;

    const nextRunTime = randomInt(startTime, endTime);
    return { name, wallet, nextRunTime } as Item;
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

  public push(wallet: ethers.Wallet) {
    const item = Queue.createItem(
      wallet,
      startOfNextUTCDay(),
      endOfNextUTCDay(),
    );

    this.items.push(item);

    this.sort();

    return item;
  }
}

export default Queue;
