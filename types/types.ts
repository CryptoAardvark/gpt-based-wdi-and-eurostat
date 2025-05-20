//API response interface
export interface ApiResponse<T> {
  data: T;
  error?: string;
}

//Date param interface
export interface DateParams {
  wdi_years: {
    start: number;
    end: number;
  };
  imf_years: string[];
  topics: string;
  countries: string[];
  countriesT: string[];
  simpleAnswer: string;
}

//API response interface
export interface APIResponse<T> {
  data: {
    imf: T;
    wdi: T;
    eur: T;
    topics: string;
  };
  error?: string;
}

//Pinecone interface
export interface PineconeParams {
  imf_indicators: string[];
  wdi_indicators: string[];
  eurostat_indicators: string[];
  countries: string[];
}

//define message interface for empty messages
export interface Message {
  role: string;
  content: string;
}