import db from "#db/client";
import { createUser } from "#db/queries/users";
import { createAdvisorsClients } from "#db/queries/advisors_clients";
import { faker } from "@faker-js/faker";

await db.connect();
await seed();
await db.end();
console.log("🌱 Database seeded.");

async function seed() {
  //create at least 5 advisors and 20 clients
  for (let i = 0; i < 5; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email(firstName, lastName);
    const password = faker.internet.password();
    await createUser(email, password, firstName, lastName, "advisor");
  }

  for (let i = 0; i < 20; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email(firstName, lastName);
    const password = faker.internet.password();
    await createUser(email, password, firstName, lastName, "client");
    await createAdvisorsClients(
      1 + Math.floor(Math.random() * 5),
      i + 6, // client id starting from 6
    );
  }
}
