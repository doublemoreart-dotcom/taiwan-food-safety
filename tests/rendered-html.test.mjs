import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request("http://localhost/taiwan-food-safety/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the food safety governance guide", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /台灣食安管理流程與權責分工/);
  assert.match(html, /治理導航/);
  assert.match(html, /責任判讀/);
  assert.match(html, /網站載入進度/);
  assert.match(html, /正在準備字型與互動內容/);
  assert.match(html, /rel="icon"[^>]+favicon\.ico/);
  assert.match(html, /rel="canonical"[^>]+http:\/\/dinopeng\.com\/taiwan-food-safety\//);
  assert.match(html, /property="og:url"[^>]+http:\/\/dinopeng\.com\/taiwan-food-safety\//);
  assert.match(html, /property="og:image"[^>]+opengraph-image\.png/);
  assert.match(html, /name="twitter:image"[^>]+twitter-image\.png/);
  assert.match(html, /name="app-version"[^>]+0\.1\.1/);
  assert.match(html, /googletagmanager\.com\/gtag\/js\?id=G-JMBSNGKG9J/);
  assert.match(html, /gtag\('config', 'G-JMBSNGKG9J'\)/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/);
});
