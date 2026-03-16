import { runScraper } from "../scraper/runScraper.js";
import { Song } from "../models/Song.model.js";

async function runScraperService() {
  try {
    const songs = await runScraper();

    const validSongs = songs.filter((song) => song.trackId);

    const result = await Song.bulkWrite(
      validSongs.map((song) => ({
        updateOne: {
          filter: { trackId: song.trackId },
          update: { $set: song },
          upsert: true,
        },
      })),
    );

    return {
      message: "Scraper finished",
      processed: validSongs.length,
      inserted: result.upsertedCount,
      updated: result.modifiedCount,
    };
  } catch (error) {
    console.error("Scraper service error:", error);
    throw error;
  }
}

export default runScraperService;
