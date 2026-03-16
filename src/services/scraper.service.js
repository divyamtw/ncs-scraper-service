import { runScraper } from "../scraper/runScraper.js";
import { Song } from "../models/Song.model.js";

async function runScraperService() {
  const songs = await runScraper();

  await Song.bulkWrite(
    songs.map((song) => ({
      updateOne: {
        filter: { trackId: song.trackId },
        update: { $set: song },
        upsert: true,
      },
    })),
  );

  return {
    message: "Scraper finished",
    songsProcessed: songs.length,
  };
}

export default runScraperService;
