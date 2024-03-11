import { z } from "zod";
import { parse, format } from "date-fns";
import { readByLine, writeFile } from "@alfar/helpers";
import { FILE_TABLE } from "./constants";

const divider = ",";
const dateFormat = "MM/dd hh:mm";

const tableItemSchema = z.object({
  address: z.string().refine((value) => /^(0x)?[0-9a-fA-F]{40}$/.test(value), {
    message: "Invalid Ethereum address format",
  }),
  updatedAt: z.string().transform((d) => parse(d, dateFormat, new Date())),
  totalLeaves: z.number().positive().multipleOf(1).or(z.string().length(0)),
});

const parseStringItem = (item: string) => {
  const [address, updatedAt, totalLeaves] = item.split(divider);

  const parsed = tableItemSchema.safeParse({ address, updatedAt, totalLeaves });

  return parsed.success ? parsed.data : null;
};

const formatObjectItem = (
  address: string,
  updatedAt: Date,
  totalLeaves?: number,
  checkInStreak?: number,
) => {
  const updatedAtStr = format(updatedAt, dateFormat);
  const totalLeavesStr = totalLeaves || "";
  const checkInStreakStr = checkInStreak || "";
  return [address, updatedAtStr, checkInStreakStr, totalLeavesStr].join(
    divider,
  );
};

export const initEmptyItem = (address: string) => {
  return formatObjectItem(address, new Date());
};

export const checkIsTableValid = (addresses: string[]) => {
  const tableAddress = readByLine(FILE_TABLE);

  if (tableAddress.length !== addresses.length) return false;

  const parsedAddresses = tableAddress.map(parseStringItem);

  const isAllAddressesValid = parsedAddresses.every(Boolean);

  if (!isAllAddressesValid) return false;

  const isAllAddressesInTable = addresses.every((a) =>
    parsedAddresses.some((p) => p?.address === a),
  );

  if (!isAllAddressesInTable) return false;

  return true;
};

export const initTable = (addresses: string[]) => {
  const isTableValid = checkIsTableValid(addresses);

  if (isTableValid) return;

  const data = addresses.map(initEmptyItem).join("\n");

  writeFile(FILE_TABLE, data);
};

export const updateAddressData = (
  address: string,
  params: { totalLeaves?: number; checkInStreak?: number },
) => {
  const { totalLeaves, checkInStreak } = params;
  const lastData = readByLine(FILE_TABLE);

  const updatedData = lastData.map((d) => {
    const parsed = parseStringItem(d);

    if (!parsed) return d;

    if (parsed.address !== address) return d;

    return formatObjectItem(address, new Date(), totalLeaves, checkInStreak);
  });

  const data = updatedData.join("\n");

  writeFile(FILE_TABLE, data);
};
