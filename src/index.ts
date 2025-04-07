import app from "./app";
import { connectToDB } from "./config/mongoose";
import { authRouter } from "./routes/auth.router";
import { sessionsRouter } from "./routes/sessions.router";

console.log(process.env.NODE_ENV);

const ENV = process.env.NODE_ENV;
const PROD = ENV === "production";
const PORT = PROD ? process.env.PORT || 5030 : process.env.PORT || 5030;
const URL = process.env.API_URL || "localhost";

connectToDB();

app.listen(PORT, () => {
  /* eslint-disable no-console */

  app.use("/api/auth", authRouter);
  app.use("/api/sessions", sessionsRouter);

  console.log("env:", ENV);
  console.log("server started on port " + URL + ":" + PORT);
  /* eslint-enable no-console */
});
