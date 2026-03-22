import cron from "node-cron";
import { scrapePage } from "../scraper/scrapePage.js";

let isRunning = false;
// Run scraper every hour
const startCron = () => {
  console.log("Cron initialized");
  cron.schedule("0 * * * *", async () => {
    if (isRunning) return console.log("Previous job still running");

    isRunning = true;

    console.log("Running scraper...");

    try {
      for (let page = 1; page <= 3; page++) {
        await scrapePage(page);
      }
      console.log("Scraping done");
    } catch (err) {
      console.error("Scraper failed:", err);
    } finally {
      isRunning = false;
    }
  });
};
export default startCron;
