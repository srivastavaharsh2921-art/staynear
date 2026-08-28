import { app } from "../backend/dist/app.js";
import { connectDatabase } from "../backend/dist/config/database.js";

let dbConnected = false;

export default async function handler(req, res) {
  if (!dbConnected) {
    try {
      await connectDatabase();
      dbConnected = true;
    } catch (e) {
      console.error("Vercel DB Connection Error:", e);
    }
  }
  return app(req, res);
}
