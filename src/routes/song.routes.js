import express from "express";
import { getSongs, getPopularSongs } from "../controllers/song.controller.js";

const router = express.Router();

// GET /api/songs?page=2&limit=20
router.get("/songs", getSongs);

// GET /api/songs/popular?page=2&limit=10
router.get("/songs/popular", getPopularSongs);

export default router;
