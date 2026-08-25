import express from "express";
const router = express.Router();
export default router;

import { createGoal, getGoalsByClientId, deleteGoal } from "#db/queries/goals";
import requireUser from "#middleware/requireUser";

router.route("/").get(requireUser, async (req, res) => {
  if (req.user.role !== "client") return res.status(403).send("Forbidden");
  const goals = await getGoalsByClientId(req.user.id);
  res.json(goals);
});

router.route("/").post(requireUser, async (req, res) => {
  if (req.user.role !== "client") return res.status(403).send("Forbidden");
  const { name, target_amount, target_date } = req.body;
  const newGoal = await createGoal(
    req.user.id,
    name,
    target_amount,
    target_date,
  );
  res.json(newGoal);
});

router.route("/:goalId").delete(requireUser, async (req, res) => {
  if (req.user.role !== "client") return res.status(403).send("Forbidden");
  const { goalId } = req.params;
  const deletedGoal = await deleteGoal(goalId);
  if (!deletedGoal) {
    return res.status(404).send("Goal not found");
  }
  res.json(deletedGoal);
});
