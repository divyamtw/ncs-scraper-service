import axios from "axios";
import * as cheerio from "cheerio";
import { normalizeSong } from "../utils/normalizeSong.js";

export async function scrapePopularReleases() {
  const { data } = await axios.get(process.env.NCS_URL);
  const $ = cheerio.load(data);

  const popularTitles = [];

  $(".featured-tracks .item").each((i, el) => {
    const title = $(el).find(".bottom p strong").text().trim().toLowerCase();

    if (title) {
      popularTitles.push(title);
    }
  });

  return popularTitles;
}

export async function scrapePage(page) {
  const url = process.env.NCS_URL.replace(/page=\d+$/, `page=${page}`);

  console.log("Scraping:", url);

  const popularTitles = await scrapePopularReleases();
  // console.log(popularTitles);

  const { data } = await axios.get(url, {
    timeout: 10000,
  });

  if (!data) {
    console.log("Empty response");
    return [];
  }

  const $ = cheerio.load(data);

  const songs = [];
  $("a.player-play").each((i, el) => {
    const trackId = $(el).attr("data-tid");
    const title = $(el).attr("data-track")?.trim().toLowerCase();

    const rawSong = {
      trackId,
      title,
      artist: $(el).attr("data-artistraw"),
      genre: $(el).attr("data-genre"),
      mp3: $(el).attr("data-url"),
      cover: $(el).attr("data-cover"),

      isPopular: popularTitles.some((p) => title?.includes(p)),
    };

    songs.push(normalizeSong(rawSong));
  });

  return songs;
}
