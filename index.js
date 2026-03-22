import connectDB from "./src/config/db.js";
import app from "./src/app.js";
import startCron from "./src/cron/scraper.cron.js";

const port = process.env.PORT || 3000;

connectDB()
  .then(async () => {
    startCron();
    app.listen(port, () => console.log(`Server running on port : ${port}`));
  })
  .catch((error) => console.log(error));
