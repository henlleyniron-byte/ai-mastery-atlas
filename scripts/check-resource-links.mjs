import { createServer } from "vite";

const vite = await createServer({ appType: "custom", configFile: false, root: process.cwd(), resolve: { alias: { "@": process.cwd() } }, server: { middlewareMode: true } });
const { resources } = await vite.ssrLoadModule("/app/page.tsx");
await vite.close();

const queue = [...resources];
const results = [];
const worker = async () => {
  while (queue.length) {
    const item = queue.shift();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(item.url, { redirect: "follow", signal: controller.signal, headers: { "user-agent": "AI-Mastery-Atlas-Link-Audit/3.2" } });
      results.push({ id: item.id, status: response.status, finalUrl: response.url });
    } catch (error) {
      results.push({ id: item.id, status: "unverified", error: error.name });
    } finally {
      clearTimeout(timeout);
    }
  }
};

await Promise.all(Array.from({ length: 12 }, worker));
const broken = results.filter((result) => result.status === 404 || result.status === 410);
const unverified = results.filter((result) => result.status === "unverified");
console.log(JSON.stringify({ checked: results.length, confirmed404or410: broken, unverified, statusCounts: Object.groupBy(results, result => String(result.status)) }, null, 2));
if (broken.length) process.exitCode = 1;
