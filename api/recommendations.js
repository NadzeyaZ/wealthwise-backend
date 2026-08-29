import express from "express";
const router = express.Router();
export default router;

import {
  getClientsByAdvisorId,
  isAdvisorOfClient,
  getAdvisorsByClientId,
} from "#db/queries/advisors_clients";
import { getGoalsByClientId } from "#db/queries/goals";
import { getInvestmentsByClientId } from "#db/queries/investments";
import { getUserById } from "#db/queries/users";
import {
  createRecommendation,
  getRecommendationById,
  getRecommendationsByClientId,
  updateRecommendationStatus,
  updateRecommendationClientNote,
  deleteRecommendation,
} from "#db/queries/recommendations";
import requireUser from "#middleware/requireUser";
import { generateRecommendationDraft } from "#services/aiRecommendation";

/** Computes age in years from a date of birth */
function getAge(dob) {
  if (!dob) return null;
  const diffMs = Date.now() - new Date(dob).getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25));
}

router.route("/").get(requireUser, async (req, res) => {
  const clientId = req.query.clientId ?? String(req.user.id);
  const isSelf = String(req.user.id) === String(clientId);

  if (!isSelf && !(await isAdvisorOfClient(req.user.id, clientId))) {
    return res.status(403).send("Access denied. Not your client.");
  }

  const recommendations = await getRecommendationsByClientId(clientId);
  res.send(recommendations);
});
router.route("/").post(requireUser, async (req, res) => {
  const { clientId, advisorId, goalId, content, status, clientNote } = req.body;

  if (!(await isAdvisorOfClient(advisorId, clientId))) {
    return res.status(403).send("Access denied. Not your client.");
  }

  const newRecommendation = await createRecommendation(
    clientId,
    advisorId,
    goalId ?? null,
    content,
    status,
    clientNote,
  );
  res.status(201).send(newRecommendation);
});

router.route("/generate").post(requireUser, async (req, res) => {
  const { clientId, goalId } = req.body;

  if (!(await isAdvisorOfClient(req.user.id, clientId))) {
    return res.status(403).send("Access denied. Not your client.");
  }

  const investments = await getInvestmentsByClientId(clientId);
  const allGoals = await getGoalsByClientId(clientId);
  const goals = goalId
    ? allGoals.filter((goal) => String(goal.id) === String(goalId))
    : allGoals;
  const client = await getUserById(clientId);
  const age = getAge(client?.dob);

  try {
    const draft = await generateRecommendationDraft({
      investments,
      goals,
      age,
    });
    res.status(200).send({ draft });
  } catch (e) {
    console.error(e);
    res.status(502).send("Failed to generate AI recommendation.");
  }
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

router.route("/:recommendationId").delete(requireUser, async (req, res) => {
  const { recommendationId } = req.params;

  if (req.user.role !== "advisor") {
    return res.status(403).send("Forbidden");
  }

  const recommendation = await getRecommendationById(recommendationId);
  if (!recommendation) {
    return res.status(404).send("Recommendation not found");
  }

  if (!(await isAdvisorOfClient(req.user.id, recommendation.client_id))) {
    return res.status(403).send("Access denied. Not your client.");
  }

  await deleteRecommendation(recommendationId);
  res.status(204).send();
});
