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
  createRecommendation,
  getRecommendationsByClientId,
  updateRecommendationStatus,
  updateRecommendationClientNote,
} from "#db/queries/recommendations";
import requireUser from "#middleware/requireUser";

router.route("/").get(requireUser, async (req, res) => {
  const clientId = req.query.clientId ?? String(req.user.id);
  const isSelf = String(req.user.id) === String(clientId);

  if (!isSelf && !(await isAdvisorOfClient(req.user.id, clientId))) {
    return res.status(403).send("Access denied. Not your client.");
  }

  const recommendations = await getRecommendationsByClientId(clientId);
  res.send(recommendations);
});

router.route("/:recommendationId/status").put(requireUser, async (req, res) => {
  const { recommendationId } = req.params;
  const { status } = req.body;

  const updatedRecommendation = await updateRecommendationStatus(
    recommendationId,
    status,
  );
  res.send(updatedRecommendation);
});

router
  .route("/:recommendationId/client-note")
  .put(requireUser, async (req, res) => {
    const { recommendationId } = req.params;
    const { clientNote } = req.body;

    const updatedRecommendation = await updateRecommendationClientNote(
      recommendationId,
      clientNote,
    );
    res.send(updatedRecommendation);
  });
