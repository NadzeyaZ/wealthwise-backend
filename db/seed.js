import db from "#db/client";
import { createUser } from "#db/queries/users";
import { createAdvisorsClients } from "#db/queries/advisors_clients";
import { createInvestment } from "#db/queries/investments";
import fs from "fs/promises";
import { faker } from "@faker-js/faker";

await db.connect();
await seed();
await db.end();
console.log("🌱 Database seeded.");

async function seed() {
  //create at least 5 advisors
  for (let i = 0; i < 5; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName });
    const password = faker.internet.password();
    const dob = faker.date.between({ from: "1945-01-01", to: "2005-01-01" });
    console.log(`Advisor email and password: ${email} ${password}`);
    await createUser(email, password, firstName, lastName, "advisor", dob);
  }

  //create at least 20 clients and assign them to advisors
  for (let i = 0; i < 20; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName });
    const password = faker.internet.password();
    const dob = faker.date.between({ from: "1945-01-01", to: "2005-01-01" });
    console.log(
      `Client name, email and password: ${firstName} ${lastName}, ${email} ${password}`,
    );
    await createUser(email, password, firstName, lastName, "client", dob);
    await createAdvisorsClients(
      1 + Math.floor(Math.random() * 5),
      i + 6, // client id starting from 6
    );
  }

  //create 5 to 10 invetsments for each client

  // seed investments from the CSV
  const csvText = await fs.readFile(
    new URL("../mocked_data/investments_test_data.csv", import.meta.url),
    "utf8",
  );

  const rows = csvText.trim().split("\n").slice(1); // skip header

  for (const row of rows) {
    if (!row.trim()) continue;

    const [id, client_id, name, asset_class, quantity, unit_price] =
      row.split(",");

    await createInvestment(
      Number(client_id),
      name,
      asset_class,
      Number(quantity),
      Number(unit_price),
    );
  }
}
