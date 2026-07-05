import { execSync } from "child_process";

export function resetDatabase() {
  execSync("npm run db:seed", { stdio: "inherit" });
}
