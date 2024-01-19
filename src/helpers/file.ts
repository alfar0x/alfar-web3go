import fs from "fs";

const encoding = "utf-8";

export const readFile = (name: fs.PathOrFileDescriptor) =>
  fs.readFileSync(name, { encoding });

export const readByLine = (name: string) =>
  readFile(name)
    .split(/\r?\n/)
    .filter(Boolean)
    .map((t) => t.trim());

export const writeFile = (
  name: fs.PathOrFileDescriptor,
  data: string | NodeJS.ArrayBufferView,
) => {
  fs.writeFileSync(name, data, { encoding });
};
