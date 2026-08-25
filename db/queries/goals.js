import db from "#db/client";

export async function getGoalsByClientId(client_id) {
  const sql = `SELECT * FROM goals WHERE client_id = $1`;
  const { rows } = await db.query(sql, [client_id]);
  return rows;
}

export async function createGoal(client_id, name, target_amount, target_date) {
  const sql = `
    INSERT INTO goals (client_id, name, target_amount, target_date)
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `;
  const { rows } = await db.query(sql, [
    client_id,
    name,
    target_amount,
    target_date,
  ]);
  return rows[0];
}

export async function deleteGoal(goal_id) {
  const sql = `DELETE FROM goals WHERE id = $1 RETURNING *`;
  const { rows } = await db.query(sql, [goal_id]);
  return rows[0];
}
