const express = require("express");
const app = express();

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});

//----------------------------------------------------------********************************_____________________________________

import { UrlGenerator } from "./utils/nlpProcessor";
import * as dotenv from "dotenv";
import { Worker } from "worker_threads";
import * as path from "path";
import { ResultURLData } from "./types/type";

dotenv.config();