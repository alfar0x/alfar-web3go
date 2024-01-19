/* eslint-disable no-console */
import fs from "fs";
import path from "path";

const initializeFiles = (paths: string[]) => {
  paths.forEach((filePath) => {
    const absolutePath = path.resolve(filePath);

    if (fs.existsSync(absolutePath)) return;

    const isDirectory = path.extname(filePath) === "";

    if (isDirectory) {
      fs.mkdirSync(absolutePath, { recursive: true });
      console.info(`Directory created: ${absolutePath}`);
      return;
    }

    const dirname = path.dirname(absolutePath);

    if (!fs.existsSync(dirname)) {
      fs.mkdirSync(dirname, { recursive: true });
      console.info(`Directory created: ${dirname}`);
    }

    fs.writeFileSync(absolutePath, "", "utf-8");
    console.info(`File created: ${absolutePath}`);
  });
};

export default initializeFiles;
