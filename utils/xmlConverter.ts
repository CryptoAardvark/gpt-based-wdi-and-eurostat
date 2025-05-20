import { parseString } from 'xml2js';

function convertXmlToJson(xml: string): Promise<any> {
  return new Promise((resolve, reject) => {
      if (!xml.trim().startsWith("<")) {
          reject(new Error("Invalid XML input"));
          return;
      }

      parseString(xml, (err: Error | null, result: any) => {
          if (err) {
              reject(err);
          } else {
              resolve(result);
          }
      });
  });
}

export default convertXmlToJson;
