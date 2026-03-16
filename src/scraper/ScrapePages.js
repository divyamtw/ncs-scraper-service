import { scrapePage } from "./scrapePage.js";
import { getLastPage } from "./getLastPage.js";

export async function runScraper() {
  const lastPage = await getLastPage();

  console.log("Total pages:", lastPage);

  const allSongs = [];

  for (let page = 1; page <= lastPage; page++) {
    const songs = await scrapePage(page);

    if (!songs.length) break;

    allSongs.push(...songs);

    await new Promise((r) => setTimeout(r, 500));
  }

  return allSongs;
}
