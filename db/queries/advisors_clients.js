import db from "#db/client";
import bcrypt from "bcrypt";

export async function createAdvisorsClients(advisorId, clientId) {
  const sql = `
  INSERT INTO advisors_clients
    (advisor_id, client_id)
  VALUES
    ($1, $2)
  RETURNING *
  `;
  const {
    rows: [advisorsClients],
  } = await db.query(sql, [advisorId, clientId]);
  return advisorsClients;
}

export async function getClientsByAdvisorId(advisorId) {
  const sql = `
  SELECT
    u.id,
    u.email,
    u.first_name AS "firstName",
    u.last_name AS "lastName",
    u.role,
    u.dob,
    COALESCE(SUM(i.quantity * i.unit_price), 0) AS "portfolioValue"
  FROM advisors_clients ac
  JOIN users u ON u.id = ac.client_id
  LEFT JOIN investments i ON i.client_id = u.id
  WHERE ac.advisor_id = $1
  GROUP BY u.id, u.email, u.first_name, u.last_name, u.role, u.dob
  ORDER BY u.last_name, u.first_name
  `;
  const { rows: clients } = await db.query(sql, [advisorId]);
  return clients;
}

export async function getAdvisorsByClientId(clientId) {
  const sql = `
  SELECT
    u.id,
    u.email,
    u.first_name AS "firstName",
    u.last_name AS "lastName",
    u.role
  FROM advisors_clients ac
  JOIN users u ON u.id = ac.advisor_id
  WHERE ac.client_id = $1
  ORDER BY u.last_name, u.first_name
  `;
  const { rows: advisors } = await db.query(sql, [clientId]);
  return advisors;
}

export async function isAdvisorOfClient(advisorId, clientId) {
  const sql = `
  SELECT 1
  FROM advisors_clients
  WHERE advisor_id = $1 AND client_id = $2
  `;
  const { rows } = await db.query(sql, [advisorId, clientId]);
  return rows.length > 0;
}
