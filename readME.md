# Eurostat-WDI-IMF Data Processor

This project processes and analyzes data from multiple sources, including Eurostat, WDI (World Development Indicators), and IMF (International Monetary Fund). It uses NLP (Natural Language Processing) to generate URLs for API requests and summarize data into meaningful insights.

## Features

- **Data Integration**: Combines data from Eurostat, WDI, and IMF APIs.
- **NLP-Powered Query Analysis**: Uses OpenAI's GPT model to process user queries and generate relevant API requests.
- **Visualization**: Summarizes data and recommends chart types for visualization.
- **Worker Threads**: Processes data asynchronously using worker threads for improved performance.

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Eurostat-wdi
   npm install
   ```

2. Configure environment variables:
   - Copy `.env.sample` to `.env`:
     ```bash
     cp .env.sample .env
     ```
   - Replace placeholder values with your API keys.

3. Start the application:
   ```bash
   npm start
   ```

## Project Structure

```
.env.sample          # Environment variable template
.gitignore           # Git ignore file
app.ts               # Main application entry point
package.json         # Node.js dependencies and scripts
readME.md            # Project documentation
tsconfig.json        # TypeScript configuration
indicators/          # Contains JSON data for Eurostat, WDI, and IMF indicators
nlp/
  nlpProcessor.ts    # NLP processor for query analysis and URL generation
thread/
  worker.js          # Worker thread implementation
  worker.ts          # TypeScript source for worker
types/
  types.ts           # Type definitions
utils/
  xmlConverter.ts    # Utility for XML conversion
```

## Usage

1. Start the server:
   ```bash
   npm start
   ```

2. The server will run on `http://localhost:5000`.

3. Example query:
   - Send a query like "Top 10 countries with happiest people" to the application, and it will process the data and provide a summary with visualization recommendations.

## Key Components

### `app.ts`
- Entry point of the application.
- Initializes the server and processes user queries using the `UrlGenerator` class.

### `nlp/nlpProcessor.ts`
- Contains the `UrlGenerator` class.
- Uses OpenAI's GPT model to analyze user queries and generate API URLs.
- Constructs URLs for Eurostat, WDI, and IMF APIs.

### `thread/worker.ts`
- Handles data processing in a separate thread to improve performance.

### `indicators/`
- Contains JSON files with indicator data for Eurostat, WDI, and IMF.

## Environment Variables

The following environment variables are required:

- `OPENAI_API_KEY`: API key for OpenAI.
- `PINECONE_API_KEY`: API key for Pinecone.
- `PORT`: Port number for the server (default: 5000).

## Example Workflow

1. User sends a query (e.g., "Top 10 countries with happiest people").
2. The `UrlGenerator` processes the query and generates API URLs.
3. Data is fetched from the APIs and processed in worker threads.
4. The application returns a summary, recommended chart type, and data visualization.

## Dependencies

- [OpenAI](https://www.npmjs.com/package/openai)
- [Pinecone](https://www.npmjs.com/package/@pinecone-database/pinecone)
- [Express](https://www.npmjs.com/package/express)
- [Worker Threads](https://nodejs.org/api/worker_threads.html)

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add feature-name"
   ```
4. Push to your branch:
   ```bash
   git push origin feature-name
   ```
5. Open a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- OpenAI for the GPT model.
- Pinecone for vector database support.
- World Bank, IMF, and Eurostat for data sources.