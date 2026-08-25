import express from "express";
const router = express.Router();
export default router;

import {
  getClientsByAdvisorId,
  isAdvisorOfClient,
  getAdvisorsByClientId,
} from "#db/queries/advisors_clients";
import { getGoalsByClientId } from "#db/queries/goals";
import {
  getInvestmentsByClientId,
  createInvestment,
  updateInvestment,
} from "#db/queries/investments";
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

router.route("/:clientId/advisor").get(requireUser, async (req, res) => {
  const isSelf = String(req.user.id) === req.params.clientId;
  if (!isSelf && !(await isAdvisorOfClient(req.user.id, req.params.clientId))) {
    return res.status(403).send("Access denied. Not your client.");
  }
  const advisors = await getAdvisorsByClientId(req.params.clientId);
  res.send(advisors);
});

router.route("/:clientId/investments").get(requireUser, async (req, res) => {
  const isSelf = String(req.user.id) === req.params.clientId;
  if (!isSelf && !(await isAdvisorOfClient(req.user.id, req.params.clientId))) {
    return res.status(403).send("Access denied. Not your client.");
  }
  const investments = await getInvestmentsByClientId(req.params.clientId);
  res.send(investments);
});

router.route("/:clientId/investments").post(requireUser, async (req, res) => {
  const { name, asset_class, quantity, unit_price } = req.body;
  const investment = await createInvestment(
    req.params.clientId,
    name,
    asset_class,
    quantity,
    unit_price,
  );
  res.send(investment);
});

router
  .route("/:clientId/investments/:investmentId")
  .put(requireUser, async (req, res) => {
    const { quantity } = req.body;
    const investment = await updateInvestment(
      req.params.clientId,
      req.params.investmentId,
      quantity,
    );

    if (!investment) {
      return res.status(404).send("Investment not found for this client.");
    }
    res.send(investment);
  });

router.route("/:clientId/goals").get(requireUser, async (req, res) => {
  const isSelf = String(req.user.id) === req.params.clientId;
  if (!isSelf && !(await isAdvisorOfClient(req.user.id, req.params.clientId))) {
    return res.status(403).send("Access denied. Not your client.");
  }
  const goals = await getGoalsByClientId(req.params.clientId);
  res.json(goals);
});
