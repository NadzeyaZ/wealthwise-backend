import express from "express";
const router = express.Router();
export default router;

import { getClientsByAdvisorId } from "#db/queries/advisors_clients";
import { getInvestmentsByClientId } from "#db/queries/investments";
import requireUser from "#middleware/requireUser";

router.route("/").get(requireUser, async (req, res) => {
  if (!req.user || req.user.role !== "advisor") {
    return res
      .status(403)
      .send("Access denied. Only advisors can view their clients.");
  }
  const clients = await getClientsByAdvisorId(req.user.id);
  res.send(clients);
});

router.route("/:clientId/investments").get(requireUser, async (req, res) => {
  const investments = await getInvestmentsByClientId(req.params.clientId);
  res.send(investments);
});
