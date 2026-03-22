import { Song } from "../models/Song.model.js";

export async function getSongs(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const filter = {};

    if (req.query.isPopular !== undefined) {
      filter.isPopular = req.query.isPopular === "true";
    }

    const songs = await Song.find(filter)
      .skip((page - 1) * limit)
      .limit(limit);

    res.json(songs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch popular songs" });
  }
}
