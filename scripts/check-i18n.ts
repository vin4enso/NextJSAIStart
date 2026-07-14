import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function flatten(
  obj: Record<string, unknown>,
  prefix = "",
): Record<string, string> {
  return Object.entries(obj).reduce(
    (acc, [key, value]) => {
      const k = prefix ? `${prefix}.${key}` : key;
      if (typeof value === "string") {
        acc[k] = value;
      } else if (value && typeof value === "object") {
        Object.assign(acc, flatten(value as Record<string, unknown>, k));
      }
      return acc;
    },
    {} as Record<string, string>,
  );
}

function loadMessages(locale: string): Record<string, unknown> {
  const filePath = join(root, "messages", `${locale}.json`);
  return JSON.parse(readFileSync(filePath, "utf-8"));
}

function main() {
  const en = loadMessages("en");
  const ru = loadMessages("ru");

  const enFlat = flatten(en);
  const ruFlat = flatten(ru);

  const enKeys = new Set(Object.keys(enFlat));
  const ruKeys = new Set(Object.keys(ruFlat));

  const missing: string[] = [];
  for (const key of enKeys) {
    if (!ruKeys.has(key)) {
      missing.push(key);
    }
  }

  const extra: string[] = [];
  for (const key of ruKeys) {
    if (!enKeys.has(key)) {
      extra.push(key);
    }
  }

  if (missing.length > 0) {
    console.error(`\nMissing translations in messages/ru.json:`);
    for (const key of missing) {
      console.error(`  ✗ ${key}: "${enFlat[key]}"`);
    }
  }

  if (extra.length > 0) {
    console.error(`\nExtra keys in messages/ru.json not in messages/en.json:`);
    for (const key of extra) {
      console.error(`  ? ${key}: "${ruFlat[key]}"`);
    }
  }

  if (missing.length > 0) {
    console.error(
      `\nError: ${missing.length} translation key(s) missing in messages/ru.json`,
    );
    process.exit(1);
  }

  if (extra.length > 0) {
    console.error(
      `\nWarning: ${extra.length} extra key(s) found in messages/ru.json`,
    );
  }

  console.log("All translations are in sync.");
}

main();
