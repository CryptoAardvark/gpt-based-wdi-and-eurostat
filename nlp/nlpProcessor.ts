import { OpenAI } from "openai";
import {
  DateParams,
  APIResponse,
  PineconeParams,
  Message,
  ResultParams,
} from "../types/type";
import { Pinecone } from "@pinecone-database/pinecone";

//define URL generator for nlp processor
export class UrlGenerator {
  private openai: OpenAI;
  private pineconeassist: Pinecone;

  constructor(apiKey: string, pineconeApiKey: string) {
    this.openai = new OpenAI({ apiKey: apiKey });
    this.pineconeassist = new Pinecone({ apiKey: pineconeApiKey });
  }
}