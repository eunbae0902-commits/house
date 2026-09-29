// 로컬 실행용: index.html 을 제공하고, 공공데이터포털 API 호출을 대신 전달합니다(CORS 우회).
// 사용법: node server.mjs  →  http://localhost:8787 접속, 앱의 프록시 주소에 http://localhost:8787/api 입력
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";

const PORT = process.env.PORT || 8787;
const ALLOWED = "https://apis.data.go.kr/";

createServer(async (req, res) => {
  const u = new URL(req.url, `http://localhost:${PORT}`);
  res.setHeader("Access-Control-Allow-Origin", "*");
  try {
    if (u.pathname === "/api") {
      const target = u.searchParams.get("url") || "";
      if (!target.startsWith(ALLOWED)) { res.writeHead(400); return res.end("허용되지 않은 주소"); }
      const r = await fetch(target);
      res.writeHead(r.status, { "Content-Type": r.headers.get("content-type") || "text/xml; charset=utf-8" });
      return res.end(await r.text());
    }
    const html = await readFile(new URL("./index.html", import.meta.url), "utf8");
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end("<!doctype html><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">" + html);
  } catch (e) {
    res.writeHead(502); res.end(String(e));
  }
}).listen(PORT, () => console.log(`전세 나침반: http://localhost:${PORT}`));
