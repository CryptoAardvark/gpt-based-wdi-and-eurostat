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

