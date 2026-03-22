import { Song } from "../models/Song.model.js";

async function getSongs(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const songs = await Song.find()
      .skip((page - 1) * limit)
      .limit(limit);

    res.json(songs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch songs" });
  }
}

async function getPopularSongs(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const songs = await Song.find({ isPopular: true })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json(songs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch popular songs" });
  }
}

export { getSongs, getPopularSongs };
