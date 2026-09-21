import { spawn } from "node:child_process";

// Build once before Docusaurus starts so a clean checkout has every script and stylesheet.
const build = spawn("pnpm", ["build:runtime"], { stdio: "inherit" });
const code = await new Promise((resolve) => build.on("exit", resolve));
if (code !== 0) process.exit(code || 1);
const examplesBuild = spawn("pnpm", ["build:examples"], { stdio: "inherit" });
const examplesCode = await new Promise((resolve) => examplesBuild.on("exit", resolve));
if (examplesCode !== 0) process.exit(examplesCode || 1);

const children = [
  ["--filter", "@digirati/canvas-panel-web-components", "dev:bundle"],
  ["--filter", "@digirati/canvas-panel-web-components", "exec", "tsdown", "--watch", "--no-clean"],
  ["--filter", "@canvas-panel/examples", "watch"],
  ["dev:docs"],
  ["dev:app"],
].map((args) =>
  spawn("pnpm", args, {
    stdio: "inherit",
    detached: process.platform !== "win32",
  }),
);
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  process.exitCode = code;
  for (const child of children) {
    if (!child.pid) continue;
    try {
      if (process.platform === "win32") child.kill("SIGTERM");
      else process.kill(-child.pid, "SIGTERM");
    } catch (error) {
      if (error.code !== "ESRCH") throw error;
    }
  }
}
for (const child of children) {
  child.on("error", (error) => {
    console.error(error);
    stop(1);
  });
  child.on("exit", (code) => stop(code || 0));
}
process.on("SIGINT", () => stop());
process.on("SIGTERM", () => stop());
console.log("Docs: http://127.0.0.1:3000 — application: http://127.0.0.1:5173");
