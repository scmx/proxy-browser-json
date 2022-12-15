import fetch from "node-fetch";
// import url from "url";
// import path from "path";
import cors from "cors";
import express from "express";
import type { AddressInfo } from "node:net";

const port = process.env.SERVER_PORT || 8888;
// const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

const browser = {
  domain: "http://localhost:8080",
};

const app = express();

app.use(cors());

app.get("/browse*", async (req, res) => {
  const pathname = req.params[0];
  console.log(pathname);
  if (pathname && !pathname.startsWith("/")) {
    res.send(404).end();
    return;
  }
  console.log(req.params);
  const url = `${browser.domain}/${req.params[0]}`;

  const resp = await fetch(url);
  const text = await resp.text();
  res.status(200).send(text);
});

const server = app.listen(port, () => {
  const address = server.address() as AddressInfo;
  console.log(`Server listening on http://127.0.0.1:${address.port}`);
});
