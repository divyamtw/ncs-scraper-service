import express from "express";
import { runManualScraper } from "../controllers/scraper.controller.js";

const router = express.Router();

router.post("/run", runManualScraper);

export default router;
