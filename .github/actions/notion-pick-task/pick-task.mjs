import { appendFileSync } from "node:fs";

const { NOTION_ACCESS_TOKEN, NOTION_DATABASE_ID, NOTION_PROJECT_PAGE_ID, NOTION_PICK_COUNT, GITHUB_OUTPUT } =
  process.env;
if (!NOTION_ACCESS_TOKEN || !NOTION_DATABASE_ID || !NOTION_PROJECT_PAGE_ID || !NOTION_PICK_COUNT || !GITHUB_OUTPUT) {
  throw new Error(
    "NOTION_ACCESS_TOKEN, NOTION_DATABASE_ID, NOTION_PROJECT_PAGE_ID, NOTION_PICK_COUNT, GITHUB_OUTPUT must be set",
  );
}

const notion = async (path, method = "GET", body) => {
  const res = await fetch(`https://api.notion.com/v1/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${NOTION_ACCESS_TOKEN}`,
      "Notion-Version": "2025-09-03",
      "Content-Type": "application/json",
    },
    body: body && JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Notion ${method} ${path}: ${res.status} ${await res.text()}`);
  return res.json();
};

const db = await notion(`databases/${NOTION_DATABASE_ID}`);
const dataSourceId = db.data_sources?.[0]?.id;
if (!dataSourceId) {
  throw new Error("Notion database is inaccessible or has no data sources");
}

const { results: pages } = await notion(`data_sources/${dataSourceId}/query`, "POST", {
  filter: {
    and: [
      { property: "AI開発", select: { equals: "実装可" } },
      { property: "プロジェクト", relation: { contains: NOTION_PROJECT_PAGE_ID } },
    ],
  },
  sorts: [{ timestamp: "created_time", direction: "ascending" }],
  page_size: Number(NOTION_PICK_COUNT),
});
if (pages.length === 0) {
  console.info("no implementable tasks");
  process.exit(0);
}

const readBody = async (pageId) => {
  const { results: blocks } = await notion(`blocks/${pageId}/children`);
  return blocks
    .map((b) => {
      const text = b[b.type]?.rich_text?.map((t) => t.plain_text).join("") ?? "";
      return b.type?.endsWith("list_item") && text ? `- ${text}` : text;
    })
    .filter(Boolean)
    .join("\n");
};

const tasks = await Promise.all(
  pages.map(async (p) => ({
    url: p.url,
    content: `Source: ${p.url}\n\n<task>\n${await readBody(p.id)}\n</task>\n`,
  })),
);

await Promise.all(
  pages.map((p) => notion(`pages/${p.id}`, "PATCH", { properties: { AI開発: { select: { name: "実装中" } } } })),
);
appendFileSync(GITHUB_OUTPUT, `tasks=${JSON.stringify(tasks)}\n`);
