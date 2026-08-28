import db from "#db/client";

export async function createRecommendation(
  clientId,
  advisorId,
  goal_id,
  content,
  status = "pending",
  client_note = null,
) {
  const sql = `  
    INSERT INTO recommendations
    (client_id, advisor_id, goal_id, content, status, client_note)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
    `;
  const values = [clientId, advisorId, goal_id, content, status, client_note];
  const result = await db.query(sql, values);
  return result.rows[0];
}

export async function getRecommendationsByClientId(clientId) {
  const sql = `
    SELECT *
    FROM recommendations
    WHERE client_id = $1
    ORDER BY id;
  `;
  const result = await db.query(sql, [clientId]);
  return result.rows;
}

export async function getRecommendationById(recommendationId) {
  const sql = `
    SELECT *
    FROM recommendations
    WHERE id = $1;
  `;
  const result = await db.query(sql, [recommendationId]);
  return result.rows[0];
}

export async function updateRecommendationStatus(recommendationId, status) {
  const sql = `
    UPDATE recommendations
    SET status = $1
    WHERE id = $2
    RETURNING *;
  `;
  const result = await db.query(sql, [status, recommendationId]);
  return result.rows[0];
}

export async function updateRecommendationClientNote(
  recommendationId,
  clientNote,
) {
  const sql = `
    UPDATE recommendations
    SET client_note = $1
    WHERE id = $2
    RETURNING *;
  `;
  const result = await db.query(sql, [clientNote, recommendationId]);
  return result.rows[0];
}

export async function deleteRecommendation(recommendationId) {
  const sql = `
    DELETE FROM recommendations
    WHERE id = $1
    RETURNING *;
  `;
  const result = await db.query(sql, [recommendationId]);
  return result.rows[0];
}
