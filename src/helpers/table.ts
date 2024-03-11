import { format } from "date-fns";
import { readByLine, writeFile } from "@alfar/helpers";

const divider = ",";
const dateFormat = "MM/dd hh:mm";

const formatItem = (address: string, ...items: (string | number)[]) => {
  return [address, format(new Date(), dateFormat), ...(items || [])].join(
    divider,
  );
};

export const initTable = (filename: string, addresses: string[]) => {
  const data = addresses.map((a) => formatItem(a)).join("\n");

  writeFile(filename, data);
};

export const updateAddressData = (
  filename: string,
  address: string,
  ...items: (string | number)[]
) => {
  const lastData = readByLine(filename);

  const updatedData = lastData.map((line) => {
    const lineAddress = line.split(divider)[0];

    if (lineAddress !== address) return line;

    return formatItem(address, ...items);
  });

  const data = updatedData.join("\n");

  writeFile(filename, data);
};
