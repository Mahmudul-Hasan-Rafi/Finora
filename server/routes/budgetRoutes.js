import express from "express";
import Budget from "../models/Budget.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user._id });
    res.status(200).json(budgets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { category, limit } = req.body;

    if (!category || limit === undefined) {
      return res.status(400).json({ message: "Category and limit are required" });
    }

    const budget = await Budget.findOneAndUpdate(
      { user: req.user._id, category },
      { limit },
      { new: true, upsert: true }
    );

    res.status(200).json(budget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, user: req.user._id });
    if (!budget) {
      return res.status(404).json({ message: "Budget not found" });
    }
    await budget.deleteOne();
    res.status(200).json({ message: "Budget deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;