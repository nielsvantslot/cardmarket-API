import type { VercelRequest, VercelResponse } from "@vercel/node";

function getServerUrl(req: VercelRequest): string {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const proto = (Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto) || "https";
  const host = req.headers.host || "localhost:3000";
  return `${proto}://${host}`;
}

export default function handler(req: VercelRequest, res: VercelResponse): void {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const serverUrl = getServerUrl(req);

  res.status(200).json({
    openapi: "3.0.3",
    info: {
      title: "Cardmarket Public API",
      version: "1.0.0",
      description:
        "Public REST API for product and pricing data. Internal service routes are intentionally excluded.",
    },
    servers: [{ url: serverUrl }],
    tags: [
      { name: "Products", description: "Product catalog and current price data" },
      { name: "History", description: "Historical product price points" },
    ],
    paths: {
      "/api/products": {
        get: {
          tags: ["Products"],
          summary: "List products",
          description: "Returns paginated products. Use q to filter by product name.",
          parameters: [
            {
              name: "q",
              in: "query",
              description: "Case-insensitive name filter",
              required: false,
              schema: { type: "string" },
            },
            {
              name: "limit",
              in: "query",
              description: "Number of records to return (1-100)",
              required: false,
              schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
            },
            {
              name: "offset",
              in: "query",
              description: "Records to skip",
              required: false,
              schema: { type: "integer", minimum: 0, default: 0 },
            },
          ],
          responses: {
            "200": {
              description: "Products returned",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ProductListResponse" },
                },
              },
            },
            "500": {
              description: "Server error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      "/api/products/{id}": {
        get: {
          tags: ["Products"],
          summary: "Get product by id",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              description: "Product id",
              schema: { type: "integer" },
            },
          ],
          responses: {
            "200": {
              description: "Product returned",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Product" },
                },
              },
            },
            "400": {
              description: "Invalid request",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            "404": {
              description: "Not found",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            "500": {
              description: "Server error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      "/api/products/{id}/history": {
        get: {
          tags: ["History"],
          summary: "Get price history",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              description: "Product id",
              schema: { type: "integer" },
            },
            {
              name: "limit",
              in: "query",
              required: false,
              description: "Number of history records (1-500)",
              schema: { type: "integer", minimum: 1, maximum: 500, default: 100 },
            },
          ],
          responses: {
            "200": {
              description: "History returned",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/HistoryResponse" },
                },
              },
            },
            "400": {
              description: "Invalid request",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            "500": {
              description: "Server error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        ErrorResponse: {
          type: "object",
          properties: {
            error: { type: "string" },
          },
          required: ["error"],
        },
        Price: {
          type: "object",
          properties: {
            id: { type: "integer" },
            productId: { type: "integer" },
            avg: { type: "number", nullable: true },
            low: { type: "number", nullable: true },
            trend: { type: "number", nullable: true },
            avg1: { type: "number", nullable: true },
            avg7: { type: "number", nullable: true },
            avg30: { type: "number", nullable: true },
            updatedAt: { type: "string", format: "date-time" },
          },
          required: ["id", "productId", "updatedAt"],
        },
        Product: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            categoryId: { type: "integer", nullable: true },
            categoryName: { type: "string", nullable: true },
            expansionId: { type: "integer", nullable: true },
            expansionName: { type: "string", nullable: true },
            number: { type: "string", nullable: true },
            rarity: { type: "string", nullable: true },
            isFoil: { type: "boolean", nullable: true },
            isAltered: { type: "boolean", nullable: true },
            isSigned: { type: "boolean", nullable: true },
            isFirstEd: { type: "boolean", nullable: true },
            image: { type: "string", nullable: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            price: {
              oneOf: [{ $ref: "#/components/schemas/Price" }, { type: "null" }],
            },
          },
          required: ["id", "name", "createdAt", "updatedAt", "price"],
        },
        ProductListResponse: {
          type: "object",
          properties: {
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/Product" },
            },
            meta: {
              type: "object",
              properties: {
                limit: { type: "integer" },
                offset: { type: "integer" },
                count: { type: "integer" },
                q: { type: "string" },
              },
              required: ["limit", "offset", "count", "q"],
            },
          },
          required: ["data", "meta"],
        },
        PriceHistoryItem: {
          type: "object",
          properties: {
            id: { type: "integer" },
            productId: { type: "integer" },
            avg: { type: "number", nullable: true },
            low: { type: "number", nullable: true },
            trend: { type: "number", nullable: true },
            recordedAt: { type: "string", format: "date-time" },
          },
          required: ["id", "productId", "recordedAt"],
        },
        HistoryResponse: {
          type: "object",
          properties: {
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/PriceHistoryItem" },
            },
            meta: {
              type: "object",
              properties: {
                limit: { type: "integer" },
                count: { type: "integer" },
              },
              required: ["limit", "count"],
            },
          },
          required: ["data", "meta"],
        },
      },
    },
  });
}
