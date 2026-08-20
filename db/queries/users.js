import db from "#db/client";
import bcrypt from "bcrypt";

export async function createUser(
  email,
  password,
  firstName,
  lastName,
  role,
  dob = null,
) {
  const sql = `
  INSERT INTO users
    (email, password, first_name, last_name, role, dob)
  VALUES
    ($1, $2, $3, $4, $5, $6)
  RETURNING *
  `;
  const hashedPassword = await bcrypt.hash(password, 10);
  const {
    rows: [user],
  } = await db.query(sql, [
    email,
    hashedPassword,
    firstName,
    lastName,
    role,
    dob,
  ]);
  return user;
}

export async function getUserByUsernameAndPassword(email, password) {
  const sql = `
  SELECT *
  FROM users
  WHERE email = $1
  `;
  const {
    rows: [user],
  } = await db.query(sql, [email]);
  if (!user) return null;

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return null;

  return user;
}

export async function getUserById(id) {
  const sql = `
  SELECT *
  FROM users
  WHERE id = $1
  `;
  const {
    rows: [user],
  } = await db.query(sql, [id]);
  return user;
}
