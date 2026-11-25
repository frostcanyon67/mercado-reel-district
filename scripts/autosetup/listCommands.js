#!/usr/bin/env node
const commands = require("./commands");

console.log("\nКоманды autosetup\n");
let lastGroup = null;
let maxLen = 0;
for (const cmd of commands) maxLen = Math.max(maxLen, `npm run ${cmd.npm}`.length);

for (const cmd of commands) {
  if (cmd.group !== lastGroup) {
    if (lastGroup) console.log("");
    console.log(`── ${cmd.group} ──`);
    lastGroup = cmd.group;
  }
  console.log(`  ${`npm run ${cmd.npm}`.padEnd(maxLen + 2)}${cmd.description}`);
}
console.log("");
