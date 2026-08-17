import { connectDB } from "../lib/db.js";

export default async function handler(req, res) {
  try {
    await connectDB();
    return res.status(200).json({ status: "ok", db: "connected" });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
}