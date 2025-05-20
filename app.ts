const express = require("express");
const app = express();

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});

//----------------------------------------------------------********************************_____________________________________

import { UrlGenerator } from "./nlp/nlpProcessor";
import * as dotenv from "dotenv";
import { Worker } from "worker_threads";
import * as path from "path";
import { ResultURLData } from "./types/type";

dotenv.config();

//define api key
const pineconeApiKey = process.env.PINECONE_API_KEY;
const openaiApikey = process.env.OPENAI_API_KEY;
if (!pineconeApiKey || !openaiApikey) {
  throw new Error("API key was not defined!");
}

//define url generator
const generator = new UrlGenerator(openaiApikey, pineconeApiKey);

//define main function
async function main() {

  const result = await generator.generateFromPrompt(
    "top 10 countries with happiest people - please present visully in a table or graph"
  );

  console.log("Generated URL:", result.data);

  // Example result object
  const resultURL: ResultURLData = {
    data: {
      imf: result.data.wdi,
      wdi: result.data.imf,
      eur: result.data.eur,
    },
  };

  //thread process
  const worker = new Worker(path.resolve(__dirname, "./thread/worker.js"));

  worker.postMessage({
    imfUrl: resultURL.data.imf,
    wdiUrl: resultURL.data.wdi,
    eurUrl: resultURL.data.eur,
  });

  worker.on('message', (event) => {
    const [wdiResult, imfResult, eurResult] = event as Array<any>;

    processRequestResult("IMF Data:", imfResult, wdiResult, eurResult);
  });

  worker.on('error', (error) => {
    console.error("Worker error:", error);
  });
}

main().catch(console.error);