import { execSync } from "child_process";

async function globalSetup() {
  execSync("npm run db:migrate", { stdio: "inherit" });
  execSync("npm run db:seed", { stdio: "inherit" });
}

export default globalSetup;
