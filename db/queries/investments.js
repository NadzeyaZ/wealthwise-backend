import db from "#db/client";

export async function createInvestment(
  client_id,
  name,
  asset_class,
  quantity,
  unit_price,
) {
  const sql = `
  INSERT INTO investments
    (client_id, name, asset_class, quantity, unit_price)
  VALUES
    ($1, $2, $3, $4, $5)
  RETURNING *
  `;
  const {
    rows: [investment],
  } = await db.query(sql, [client_id, name, asset_class, quantity, unit_price]);
  return investment;
}

export async function getInvestmentsByClientId(client_id) {
  const sql = `
  SELECT *
  FROM investments
  WHERE client_id = $1
  `;
  const { rows: investments } = await db.query(sql, [client_id]);
  return investments;
}
