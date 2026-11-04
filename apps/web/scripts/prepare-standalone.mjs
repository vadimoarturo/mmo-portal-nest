import { cp, mkdir, readdir, rm } from "node:fs/promises";
const root = ".next/standalone";
await mkdir(`${root}/.next`, { recursive: true });
await cp(".next/static", `${root}/.next/static`, { recursive: true });
await cp("public", `${root}/public`, { recursive: true });
// Public settings are already compiled; never ship local environment files in the server bundle.
for (const name of await readdir(root)) {
  if (name === ".env" || name.startsWith(".env."))
    await rm(`${root}/${name}`, { force: true });
}
