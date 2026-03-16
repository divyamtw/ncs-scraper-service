import axios from "axios";
import * as cheerio from "cheerio";
import { normalizeSong } from "../utils/normalizeSong.js";

export async function scrapePage(page) {
  const url = process.env.NCS_URL.replace(/page=\d+$/, `page=${page}`);

  console.log("Scraping:", url);

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
    const rawSong = {
      trackId: $(el).attr("data-tid"),
      title: $(el).attr("data-track"),
      artist: $(el).attr("data-artistraw"),
      genre: $(el).attr("data-genre"),
      mp3: $(el).attr("data-url"),
      cover: $(el).attr("data-cover"),
    };

    songs.push(normalizeSong(rawSong));
  });

  return songs;
}
