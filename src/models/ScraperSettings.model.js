import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  scraperEnabled: {
    type: Boolean,
    default: true,
  },

  intervalMinutes: {
    type: Number,
    default: 15,
  },

  lastRun: Date,
  nextRun: Date,
});

export default mongoose.model("Settings", settingsSchema);
