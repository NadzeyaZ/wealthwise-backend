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
  SELECT *
  FROM advisors_clients
  WHERE advisor_id = $1
  `;
  const { rows: clients } = await db.query(sql, [advisorId]);
  return clients;
}

export async function getAdvisorsByClientId(clientId) {
  const sql = `
  SELECT *
  FROM advisors_clients
  WHERE client_id = $1
  `;
  const { rows: advisors } = await db.query(sql, [clientId]);
  return advisors;
}
