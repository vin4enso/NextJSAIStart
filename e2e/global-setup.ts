import { execSync } from "child_process";

async function globalSetup() {
  const e2eEnv = { ...process.env, DATABASE_URL: "data/e2e.db" };
  execSync("npm run db:migrate", { stdio: "inherit", env: e2eEnv });
  execSync("npm run db:seed", { stdio: "inherit", env: e2eEnv });
}

export default globalSetup;
