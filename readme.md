# NCS Scraper Service

A production-ready scraping API service that automatically collects music data from NCS (NoCopyrightSounds) and exposes it via a scalable, rate-limited REST API.

Designed as a reusable data provider with automated updates using cron jobs.

---

## Features

- Automated scraping with cron jobs
- REST API with pagination & filtering
- Rate-limited endpoints for protection
- Upsert-based data storage (no duplicates)
- Modular architecture (controller → service → scraper)

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Architecture Overview](#architecture-overview)
- [Data Models](#data-models)
- [API Reference](#api-reference)
  - [Health Check](#health-check)
  - [Get Songs](#get-songs)
  - [Run Manual Scraper](#run-manual-scraper)
- [Scraper Internals](#scraper-internals)
- [Cron Job](#cron-job)
- [Rate Limiting](#rate-limiting)

---

## Tech Stack

| Package              | Purpose                           |
| -------------------- | --------------------------------- |
| `express` v5         | HTTP server & routing             |
| `mongoose` v9        | MongoDB ODM                       |
| `axios`              | HTTP client for scraping NCS      |
| `cheerio`            | HTML parsing (server-side jQuery) |
| `node-cron`          | Scheduled cron jobs               |
| `express-rate-limit` | API rate limiting                 |
| `dotenv`             | Environment variable management   |

---

## Project Structure

```
ncs-scraper-service/
├── index.js                        # Entry point — connects DB, starts cron & server
├── .env                            # Environment variables
├── package.json
└── src/
    ├── app.js                      # Express app setup, middleware, routes
    ├── config/
    │   └── db.js                   # MongoDB connection
    ├── routes/
    │   ├── song.routes.js          # GET /api/songs
    │   └── scraper.routes.js       # POST /scraper/run
    ├── controllers/
    │   ├── song.controller.js      # Handles song fetch logic
    │   └── scraper.controller.js   # Handles manual scrape trigger
    ├── services/
    │   └── scraper.service.js      # Orchestrates scraping & DB upsert
    ├── models/
    │   ├── Song.model.js           # Mongoose Song schema
    │   └── ScraperSettings.model.js # Mongoose Settings schema (reserved)
    ├── scraper/
    │   ├── runScraper.js           # Iterates over all pages
    │   ├── scrapePage.js           # Scrapes a single NCS page
    │   └── getLastPage.js          # Detects the total page count from pagination
    ├── cron/
    │   └── scraper.cron.js         # Cron job — runs scraper every hour
    └── utils/
        └── normalizeSong.js        # Normalizes raw scraped data into a clean shape
```

---

## Environment Variables

Create a `.env` file in the root of the project:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/
PORT=3000
NCS_URL=https://ncs.io/?display=&page=1
```

| Variable      | Description                              | Default |
| ------------- | ---------------------------------------- | ------- |
| `MONGODB_URI` | MongoDB connection string                | —       |
| `PORT`        | Port the HTTP server listens on          | `3000`  |
| `NCS_URL`     | Base NCS URL used as the scraping target | —       |

> **Note:** `NCS_URL` must end with `page=1`. The scraper dynamically replaces the page number when iterating pages.

---

## Getting Started

```bash
# Install dependencies
npm install

# Development (with auto-reload via nodemon)
npm run dev

# Production
npm start
```

The server will:

1. Connect to MongoDB
2. Start the cron scheduler
3. Listen on the configured port

---

## Architecture Overview

```
HTTP Request
     │
     ▼
  app.js (Express)
     │
     ├── Rate Limiter (100 req/min on /api/*)
     │
     ├── /api/songs  ──►  song.controller.js  ──►  Song (MongoDB)
     │
     └── /scraper/run ──►  scraper.controller.js
                                  │
                                  ▼
                          scraper.service.js
                                  │
                                  ▼
                           runScraper.js
                          /            \
                   getLastPage.js    scrapePage.js (per page)
                                          │
                                    normalizeSong.js
                                          │
                                   Song.bulkWrite() (upsert)

Cron (every hour)
     │
     └──► scrapePage.js (pages 1–3)
```

---

## Data Models

### Song

Stored in the `songs` collection in the `ncs_scraper` database.

| Field       | Type      | Required | Default | Description                          |
| ----------- | --------- | -------- | ------- | ------------------------------------ |
| `trackId`   | `String`  | ✅       | —       | Unique NCS track identifier          |
| `title`     | `String`  | ❌       | —       | Song title (lowercased)              |
| `artist`    | `String`  | ❌       | —       | Raw artist string                    |
| `genre`     | `String`  | ❌       | —       | Music genre                          |
| `mp3`       | `String`  | ❌       | —       | Direct MP3 download URL              |
| `cover`     | `String`  | ❌       | —       | Album art URL                        |
| `source`    | `String`  | ❌       | `"NCS"` | Data source identifier               |
| `isPopular` | `Boolean` | ❌       | `false` | Whether it appeared in featured list |
| `createdAt` | `Date`    | —        | auto    | Mongoose timestamp                   |
| `updatedAt` | `Date`    | —        | auto    | Mongoose timestamp                   |

> `trackId` has a **unique index** — duplicate tracks are upserted (updated in place), not duplicated.

### ScraperSettings _(reserved for future use)_

| Field             | Type      | Default | Description                      |
| ----------------- | --------- | ------- | -------------------------------- |
| `scraperEnabled`  | `Boolean` | `true`  | Toggle to enable/disable scraper |
| `intervalMinutes` | `Number`  | `15`    | Target interval in minutes       |
| `lastRun`         | `Date`    | —       | Timestamp of last scraper run    |
| `nextRun`         | `Date`    | —       | Timestamp of scheduled next run  |

---

## API Reference

### Base URL

```
http://localhost:3000
```

---

### Health Check

```
GET /
```

A simple ping to confirm the server is running.

**Response `200 OK`**

```
Hello, Dev!
```

---

### Get Songs

```
GET /api/songs
```

Returns a paginated list of songs from the database.

**Query Parameters**

| Parameter   | Type      | Default  | Description                             |
| ----------- | --------- | -------- | --------------------------------------- |
| `page`      | `number`  | `1`      | Page number (1-indexed)                 |
| `limit`     | `number`  | `20`     | Number of songs per page                |
| `isPopular` | `boolean` | _(none)_ | Filter by popularity. `true` or `false` |

**Examples**

```http
GET /api/songs
GET /api/songs?page=2&limit=10
GET /api/songs?isPopular=true
GET /api/songs?isPopular=true&page=1&limit=5
```

**Response `200 OK`**

Returns a JSON array of song objects.

```json
[
  {
    "_id": "661f4e2b3c4a1d0012abc001",
    "trackId": "72346",
    "title": "feel something",
    "artist": "Diviners",
    "genre": "House",
    "mp3": "https://ncs.io/track/stream?TrackId=72346",
    "cover": "https://ncs.io/img/covers/72346.jpg",
    "source": "NCS",
    "isPopular": true,
    "createdAt": "2024-04-17T10:22:19.000Z",
    "updatedAt": "2024-04-17T10:22:19.000Z",
    "__v": 0
  },
  ...
]
```

**Response `500 Internal Server Error`**

```json
{
  "error": "Failed to fetch popular songs"
}
```

---

### Run Manual Scraper

```
POST /scraper/run
```

Manually triggers a full scrape of all NCS pages. Scrapes every page from `1` to the last detected page. Each song is upserted into MongoDB by `trackId`.

> ⚠️ This can be slow depending on the number of pages on NCS. No body or authentication is required.

**Request Body**

None required.

**Response `200 OK`**

```json
{
  "message": "Scraper finished",
  "processed": 240,
  "inserted": 15,
  "updated": 225
}
```

| Field       | Description                                     |
| ----------- | ----------------------------------------------- |
| `message`   | Confirmation string                             |
| `processed` | Total valid songs scraped (with a `trackId`)    |
| `inserted`  | Newly added songs (upserted for the first time) |
| `updated`   | Existing songs that were updated                |

**Response `500 Internal Server Error`**

```json
{
  "error": "Scraper failed"
}
```

---

## Scraper Internals

The scraping pipeline consists of three modules inside `src/scraper/`:

### `getLastPage.js`

Fetches the NCS homepage and reads the pagination links to detect the highest page number available. This tells `runScraper` how many pages to iterate over.

### `scrapePage.js`

Scrapes a single numbered page from NCS. For each page:

- First fetches the "Popular/Featured Tracks" section to build a list of popular song titles.
- Then fetches the main track listing and extracts each song's `trackId`, `title`, `artist`, `genre`, `mp3` URL, and `cover` image URL from HTML attributes on `a.player-play` elements.
- Marks a song as `isPopular: true` if its title appears in the popular titles list.
- Passes each raw song through `normalizeSong()`.

### `runScraper.js`

Calls `getLastPage()` then loops from page `1` to the last page, collecting all songs. Adds a **500ms delay** between pages to avoid rate limiting NCS. Returns the full array of normalized songs.

### `normalizeSong.js`

Converts the raw scraped object into a clean shape. Notably, it splits the `artist` string by commas into an `artists` array:

```js
// Input
{
  artist: "Jim Yosef, Anna Yvette";
}

// Output
{
  artists: ["Jim Yosef", "Anna Yvette"];
}
```

> **Note:** The Song model stores `artist` as a single string field, while `normalizeSong` outputs an `artists` array. The upsert uses `$set`, which means the stored document will reflect whatever `normalizeSong` returns.

---

## Cron Job

Defined in `src/cron/scraper.cron.js`.

- **Schedule:** Every hour at minute `0` (`0 * * * *`)
- **Behavior:** Scrapes pages **1 through 3** only (the most recently updated pages), keeping the database fresh without re-scraping the entire catalog every hour.
- **Guard:** Uses an `isRunning` flag to prevent overlapping runs if a previous job is still in progress.

---

## Rate Limiting

Applied to all `/api/*` routes via `express-rate-limit`:

| Setting      | Value                               |
| ------------ | ----------------------------------- |
| Window       | 60 seconds                          |
| Max requests | 100 per window                      |
| Response     | `"Too many requests, chill bro 😄"` |
| Headers      | Standard rate-limit headers enabled |

The `/scraper/run` endpoint is **not** rate-limited.
