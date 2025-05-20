
const axios = require("axios");
const {parentPort} = require("worker_threads")

parentPort.on("message", async (event) => {
    const { imfUrl, wdiUrl, eurUrl } = event;

    // Use Promise.allSettled to handle each request
    const results = await Promise.allSettled([
        fetchData(imfUrl),
        fetchData(wdiUrl),
        fetchData(eurUrl),
    ]);

    parentPort.postMessage(results);
});

async function fetchData(url) {
    if (!url) return null; // Skip empty URLs
    try {
        const response = await axios.get(url, {
            headers: { Accept: "application/json", "Content-Type": "application/json" },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching data:", error.message);
        return { error: error.message };
    }
}