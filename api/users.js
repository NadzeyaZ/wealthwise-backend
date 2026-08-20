import express from "express";
const router = express.Router();
export default router;

import {
  createUser,
  getUserByUsernameAndPassword,
  getUserById,
} from "#db/queries/users";
import requireBody from "#middleware/requireBody";
import { createToken } from "#utils/jwt";

router
  .route("/register")
  .post(
    requireBody(["email", "password", "firstName", "lastName", "role"]),
    async (req, res) => {
      const { email, password, firstName, lastName, role } = req.body;
      const user = await createUser(email, password, firstName, lastName, role);

      const token = await createToken({ id: user.id });
      res.status(201).send(token);
    },
  );

router
  .route("/login")
  .post(requireBody(["email", "password"]), async (req, res) => {
    const { email, password } = req.body;
    const user = await getUserByUsernameAndPassword(email, password);
    if (!user) return res.status(401).send("Invalid email or password.");

    const token = await createToken({ id: user.id });
    res.send(token);
  });

router.get("/me", async (req, res) => {
  if (!req.user) return res.status(401).send("Not authenticated.");

  const user = await getUserById(req.user.id);
  if (!user) return res.status(404).send("User not found.");

  res.send({
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    role: user.role,
    dob: user.dob,
  });
});
