import type { VercelRequest, VercelResponse } from "@vercel/node";

function getServerUrl(req: VercelRequest): string {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const proto = (Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto) || "https";
  const host = req.headers.host || "localhost:3000";
  return `${proto}://${host}`;
}

export default function handler(req: VercelRequest, res: VercelResponse): void {
  if (req.method !== "GET") {
    res.status(405).send("Method not allowed");
    return;
  }

  const serverUrl = getServerUrl(req);

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Cardmarket Public API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
    <style>
      html, body { margin: 0; padding: 0; background: #fafafa; }
      #swagger-ui { max-width: 1200px; margin: 0 auto; }
      .topbar { display: none; }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: "${serverUrl}/api/openapi",
        dom_id: "#swagger-ui",
      });
    </script>
  </body>
</html>`);
}
