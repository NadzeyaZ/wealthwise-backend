import db from "#db/client";
import { createUser } from "#db/queries/users";
import { createAdvisorsClients } from "#db/queries/advisors_clients";
import { createInvestment } from "#db/queries/investments";
import { createGoal } from "#db/queries/goals";
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

    const age = getAge(dob);
    const goals = generateGoalsForAge(age);
    for (const goal of goals) {
      await createGoal(i + 6, goal.name, goal.targetAmount, goal.targetDate);
    }
  }

  //create goals for 10 random clients

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

function getAge(dob) {
  const diffMs = Date.now() - dob.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25));
}

function generateGoalsForAge(age) {
  // returns 1-3 goal templates realistic for this life stage
  const pool = [];

  if (age < 30) {
    pool.push(
      {
        name: "Emergency Fund (6 Months)",
        min: 10000,
        max: 30000,
        yearsOut: [1, 2],
      },
      {
        name: "Pay Off Student Loans",
        min: 15000,
        max: 60000,
        yearsOut: [2, 5],
      },
      {
        name: "Save for First Home",
        min: 40000,
        max: 100000,
        yearsOut: [3, 6],
      },
      { name: "Wedding Fund", min: 15000, max: 50000, yearsOut: [1, 3] },
    );
  } else if (age < 45) {
    pool.push(
      { name: "Buy Larger Home", min: 100000, max: 300000, yearsOut: [2, 5] },
      {
        name: "College Fund - Child",
        min: 80000,
        max: 250000,
        yearsOut: [10, 18],
      },
      { name: "Start a Business", min: 50000, max: 200000, yearsOut: [2, 4] },
      {
        name: "Family Emergency Fund",
        min: 20000,
        max: 50000,
        yearsOut: [1, 2],
      },
    );
  } else if (age < 60) {
    pool.push(
      {
        name: "Retirement Nest Egg",
        min: 800000,
        max: 2500000,
        yearsOut: [10, 20],
      },
      {
        name: "Pay Off Mortgage Early",
        min: 100000,
        max: 300000,
        yearsOut: [5, 12],
      },
      {
        name: "Second Home / Vacation Property",
        min: 200000,
        max: 700000,
        yearsOut: [3, 8],
      },
      {
        name: "College Fund - Child",
        min: 100000,
        max: 250000,
        yearsOut: [2, 8],
      },
    );
  } else {
    pool.push(
      {
        name: "Retirement Income Plan",
        min: 1000000,
        max: 3000000,
        yearsOut: [0, 3],
      },
      {
        name: "Legacy / Estate Planning",
        min: 300000,
        max: 1500000,
        yearsOut: [5, 20],
      },
      {
        name: "Healthcare & Long-Term Care Fund",
        min: 100000,
        max: 400000,
        yearsOut: [1, 5],
      },
      {
        name: "Travel & Leisure Fund",
        min: 20000,
        max: 80000,
        yearsOut: [1, 3],
      },
    );
  }

  // pick 0-3 goals at random from the relevant pool
  const count = Math.floor(Math.random() * 4);
  const chosen = faker.helpers.arrayElements(
    pool,
    Math.min(count, pool.length),
  );

  return chosen.map((g) => {
    const targetAmount = faker.number.float({
      min: g.min,
      max: g.max,
      fractionDigits: 2,
    });
    const yearsOut =
      g.yearsOut[0] + Math.random() * (g.yearsOut[1] - g.yearsOut[0]);
    const targetDate = new Date();
    targetDate.setFullYear(targetDate.getFullYear() + Math.round(yearsOut));
    return { name: g.name, targetAmount, targetDate };
  });
}
