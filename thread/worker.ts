self.onmessage = async function(event) {
  const { imfUrl, wdiUrl, eurUrl } = event.data;

  // Use Promise.allSettled to handle each request
  const results = await Promise.allSettled([
      fetchData(imfUrl),
      fetchData(wdiUrl),
      fetchData(eurUrl)
  ]);

  self.postMessage(results);
};

async function fetchData(url: string): Promise<any> {
  if (!url) return null;  // Skip empty URLs
  try {
      const response = await fetch(url, {
          headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) {
          throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
      }
      return await response.json();
  } catch (error) {
      return { error: error.message };
  }
}