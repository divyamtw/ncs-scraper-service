import axios from "axios";
import * as cheerio from "cheerio";

export async function getLastPage() {
  const { data } = await axios.get(process.env.NCS_URL);

  const $ = cheerio.load(data);

  let maxPage = 1;

  $(".pagination a.page-link").each((i, el) => {
    const text = $(el).text().trim();
    const page = parseInt(text);

    if (!isNaN(page) && page > maxPage) {
      maxPage = page;
    }
  });

  return maxPage;
}
