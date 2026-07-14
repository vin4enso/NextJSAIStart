import { readFileSync } from "fs";

const FILES = ["messages/en.json", "messages/ru.json"];

function getFlattenedKeys(obj, prefix = "") {
  return Object.entries(obj).flatMap(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return getFlattenedKeys(value, fullKey);
    }
    return fullKey;
  });
}

const parsed = FILES.map((file) => ({
  file,
  data: JSON.parse(readFileSync(file, "utf-8")),
}));

const keysets = parsed.map(({ file, data }) => ({
  file,
  keys: new Set(getFlattenedKeys(data)),
}));

const allKeys = [...new Set(keysets.flatMap((k) => [...k.keys]))].sort();

let exitCode = 0;

for (const key of allKeys) {
  for (const { file, keys } of keysets) {
    if (!keys.has(key)) {
      console.log(`  MISSING  ${key}  (${file})`);
      exitCode = 1;
    }
  }
}

if (exitCode === 0) {
  console.log(`All ${allKeys.length} keys are present in both locale files.`);
}
process.exit(exitCode);
