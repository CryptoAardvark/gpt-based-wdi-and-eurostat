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

  //define function to analysis user's query
  async generateFromPrompt(prompt: string): Promise<APIResponse<string>> {
    try {
      //AI Parsing using openai
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4-1106-preview",
        messages: [
          {
            role: "system",
            content: `"You are a professional AI assistant. Always return a valid JSON object in the following format.
            When analyzing a user's query:

            Extract Year or Period:
            If a single year is mentioned, set both "start" and "end" to this year.
            If a range of years is mentioned, use the range for "start" and "end".
            If no year is mentioned, default to the latest updated data year, 2023.

            Generate Country Codes:
            If the query involves a list of countries without specific names (e.g., "top 10 countries"), infer or suggest relevant countries based on context (like region or economic indicators) and populate with ISO codes.
            Identify Topics:
            If the query doesn't include special topic, topic set to GDP.
            Detect economic and financial topics such as growth rates, inflation, etc.

            IMF Year Array:
            Fill "imf_years" with all years in the specified range or the inferred single year.

            JSON Response:
            {
              "wdi_years": {"start": YYYY, "end": YYYY},
              "imf_years": ["YYYY", "YYYY", "YYYY"],
              "topics": "topic_name1 and topic_name2 and topic_name3",
              "countries": ["country_iso3code1", "country_iso3code2", "country_iso3code3"],
              "countriesT": ["country_iso2code1", "country_iso2code2", "country_iso2code3"],
              "simpleAnswer": "Type: string | Description: Friendly response to general/non-data questions"
            }

            General Queries Handling:
            For queries that lack specifics (years, countries) or aren't related to IMF/WDI data:
            Only provide an answer under "simpleAnswer".
            Set all other fields ("wdi_years", "imf_years", "topics", "countries") to null."`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0,
      });

      //exception for ai parsing
      if (!completion.choices[0].message.content) {
        throw new Error("AI response content is null");
      }

      //parse AI response to json
      let sanitizedContent = completion.choices[0].message.content
        .replace(/```json/g, "") // Remove JSON code block markers
        .replace(/```/g, "") // Remove stray backticks
        .trim();
      // console.log("sanitizedContent ->", sanitizedContent);

      let params: DateParams = JSON.parse(sanitizedContent);
      // console.log("params ->", params);

      //Case response includes only simple answer.
      if (params.simpleAnswer !== null) {
        return { data: { wdi: "", imf: "", eur: "", topics: params.topics } };
      } else {
        //AI Parsing using pinecone
        const assistant = this.pineconeassist.Assistant("financial-assistant");

        const msg: Message = {
          role: "user",
          content: params.topics,
        };

        const resp = await assistant._chat({ messages: [msg] });
        if (!resp.message) {
          throw new Error("Pinecone response content is null");
        }

        const pineconeParams: PineconeParams = JSON.parse(
          resp.message.content!
        );

        console.log("pineconeParams ->", pineconeParams);

        //URL Construction
        let WDIurl: string = "";
        let IMFurl: string = "";
        let Eurostaturl: string = "";
        //wdi url construction
        if (
          params.countries !== null &&
          Array.isArray(pineconeParams.wdi_indicators) &&
          pineconeParams.wdi_indicators.length !== 0 &&
          params.wdi_years !== null
        ) {
          WDIurl =
            `https://api.worldbank.org/v2/country/${params.countries.join(
              ";"
            )}` +
            `/indicator/${pineconeParams.wdi_indicators.join(";")}` +
            `?date=${params.wdi_years.start}:${params.wdi_years.end}`;
        }
        //define imf url construction
        if (
          params.countries !== null &&
          Array.isArray(pineconeParams.imf_indicators) &&
          pineconeParams.imf_indicators.length !== 0 &&
          Array.isArray(params.imf_years) &&
          params.imf_years.length !== 0
        ) {
          IMFurl =
            `https://www.imf.org/external/datamapper/api/v2/${pineconeParams.imf_indicators.join(
              "/"
            )}/${params.countries.join("/")}` +
            `?periods=${params.imf_years.join(",")}`;
        }
        //define eurostat url construction
        if (
          params.countries !== null &&
          Array.isArray(pineconeParams.eurostat_indicators) &&
          pineconeParams.eurostat_indicators.length !== 0 &&
          Array.isArray(params.imf_years) &&
          params.imf_years.length !== 0
        ) {
          pineconeParams.eurostat_indicators.map((item) => {
            item.toLowerCase();
          });
          Eurostaturl =
            `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/${pineconeParams.eurostat_indicators.join(
              "/"
            )}?lang=EN&freq=A&geo=${params.countriesT.join("&geo=")}` +
            `&time=${params.imf_years.join("&time=")}`;
        }
        return {
          data: {
            wdi: WDIurl,
            imf: IMFurl,
            eur: Eurostaturl,
            topics: params.topics,
          },
        };
      }
    } catch (error) {
      console.log("error ->", " error is ready");
      let errorMessage = "Unknown error";
      if (error instanceof Error) errorMessage = error.message;
      return {
        data: { wdi: "", imf: "", eur: "", topics: "" },
        error: errorMessage,
      };
    }
  }

  async generateResult(
    prompt: string,
    imfData: string,
    wdiData: string,
    eurostatData: string
  ) {
    try {
      //AI Parsing using openai
      try {
        console.log("eurostatData ->", eurostatData);
        if (imfData !== "" && wdiData !== "" && eurostatData !== "") {
          const completion = await this.openai.chat.completions.create({
            model: "gpt-4-1106-preview",
            messages: [
              {
                role: "system",
                content: `"You are a professional AI assistant. Given context from result of eurostat api:${eurostatData}, + result of imf api: ${imfData}, + result of eurostat api: ${wdiData}, summarize it based on the user's query and generate only a JSON object and no other output. The JSON should include a comprehensive summary, a recommended chart type, and detailed chart source information.
                JSON Format:
                {
                  "chart_source": [
                    {
                      "Topic": "indicator1",
                      "Unit": "unit1",
                      "country": [
                        {
                          "country_name": "country1",
                          "values": [
                            {"year1": "value1"},
                            {"year2": "value2"}
                          ]
                        },
                        {
                          "country_name": "country2",
                          "values": [
                            {"year1": "value3"},
                            {"year2": "value4"}
                          ]
                        }
                      ]
                    },
                    {
                      "Topic": "indicator2",
                      "Unit": "unit2",
                      "country": [
                        {
                          "country_name": "country1",
                          "values": [
                            {"year1": "value1"},
                            {"year2": "value2"}
                          ]
                        },
                        {
                          "country_name": "country2",
                          "values": [
                            {"year1": "value1"},
                            {"year2": "value2"}
                          ]
                        }
                      ]
                    }
                  ],
                  "recommend_chart_type": "bar/line/pie/scatter/table/heatmap",
                  "summary": "This is a summary of the data."
                }
                Instructions:
                Contextual Analysis: Parse the provided context (${eurostatData} + ${wdiData} + ${imfData}) thoroughly.
                Chart Source: Extract topics, units, countries, and values for each year accurately. Ensure no null returns if the context is valid.
                Chart Recommendation: Choose a suitable chart type (bar, line, pie, scatter, table, heatmap) based on the nature of the data.
                Summary Creation: Generate a concise, informative overview of the data.
                Response Optimization: Structure processing to minimize latency and improve response times.
                Empty Context: If no relevant data is found in the context, return an empty string for each field.
                Ensure all fields are derived from the available context. Return only the specified JSON format with no additional output."`,
              },

              {
                role: "user",
                content: prompt,
              },
            ],
            temperature: 1,
          });
          if (!completion.choices[0].message.content) {
            throw new Error("AI response content is null");
          }
          let sanitizedContent = completion?.choices[0].message.content
            .replace(/```json/g, "") // Remove JSON code block markers
            .replace(/```/g, "") // Remove stray backticks
            .trim();
          console.log("sanitizedContent ->", sanitizedContent);
          const params: ResultParams = JSON.parse(sanitizedContent);
          console.log("correct result", params);
          return { data: params };
        } else {
          throw new Error("imfData or wdiData is empty");
        }
      } catch (error: any) {
        console.log("error ->", error);
        const recompletiton = await this.openai.chat.completions.create({
          model: "gpt-4-1106-preview",
          messages: [
            {
              role: "system",
              content: `Provide a concise and general response (3-5 lines) to the user's query. Avoid specific details unless explicitly requested.`,
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        });
        if (!recompletiton.choices[0].message.content) {
          throw new Error("AI response content is null");
        }
        let sanitizedContent = recompletiton?.choices[0].message.content
          .replace(/```json/g, "") // Remove JSON code block markers
          .replace(/```/g, "") // Remove stray backticks
          .trim();

        let emptyMessage: string = sanitizedContent;

        console.log("emptyMessage ->", emptyMessage);

        let summaryMessage: ResultParams = {
          chart_source: [],
          recommend_chart_type: "",
          summary: "",
        };
        summaryMessage.summary = emptyMessage;
        return { data: summaryMessage };
      }
    } catch (error) {
      let errorMessage = "Unknown error";
      if (error instanceof Error) errorMessage = error.message;
      return { data: "", error: errorMessage };
    }
  }
}
