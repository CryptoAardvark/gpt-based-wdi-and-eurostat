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
