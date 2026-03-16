import { Schema, model } from "mongoose";

const songSchema = new Schema(
  {
    trackId: {
      type: String,
      required: true,
    },

    title: String,
    artist: String,
    genre: String,

    mp3: String,
    cover: String,

    source: {
      type: String,
      default: "NCS",
    },
  },
  { timestamps: true },
);

songSchema.index({ trackId: 1 }, { unique: true });

export const Song = model("Song", songSchema);
