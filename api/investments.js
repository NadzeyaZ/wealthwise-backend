import express from "express";
const router = express.Router();
export default router;

import {
  createInvestment,
  getInvestmentsByClientId,
} from "#db/queries/investments";

import requireBody from "#middleware/requireBody";
import requireUser from "#middleware/requireUser";

router.route("/").get(requireUser, async (req, res) => {
  if (req.user.role !== "client") return res.status(403).send("Forbidden");

  const investments = await getInvestmentsByClientId(req.user.id);
  res.send(investments);
});
