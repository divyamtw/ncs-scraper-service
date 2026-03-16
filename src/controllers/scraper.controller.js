import runScraperService from "../services/scraper.service.js";

async function runManualScraper(req, res) {
  try {
    const result = await runScraperService();

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Scraper failed" });
  }
}

export { runManualScraper };
