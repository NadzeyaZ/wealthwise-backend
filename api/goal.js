import express from "express";
const router = express.Router();
export default router;

import { createGoal, getGoalsByClientId } from "#db/queries/goals";
import requireUser from "#middleware/requireUser";

router.route("/goals").get(requireUser, async (req, res) => {
  if (req.user.role !== "client") return res.status(403).send("Forbidden");
  const goals = await getGoalsByClientId(req.user.id);
  res.json(goals);
});
