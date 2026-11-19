import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import express from "express";

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const files = fs.readdirSync(__dirname);

for (const file of files) {
  if (file === "index.js" || !file.endsWith(".js")) continue;

  const routeName = file.replace(/\.js$/, "");
  const fileUrl = pathToFileURL(path.join(__dirname, file)).href;
  const routeModule = await import(fileUrl);

  if (routeModule.default) {
    router.use(`/${routeName}`, routeModule.default);
  }
}

export default router;
