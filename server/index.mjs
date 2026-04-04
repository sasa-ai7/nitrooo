import { createServer } from "node:http";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const DIST_DIR = path.join(ROOT_DIR, "dist");
const PORT = Number(process.env.PORT || 8787);
const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

const HIGH_RISK_ISP_PATTERN = /vpn|proxy|hosting|cloud|digitalocean|amazon|aws|google|microsoft|azure|vultr|ovh|hetzner|contabo|linode/i;

const ORDER_CATALOG = {
  chatgpt: {
    name: "ChatGPT",
    plans: { Plus: 9.99, Pro: 99.99, Business: 14.99 },
  },
  gemini: {
    name: "Gemini",
    plans: { Advanced: 9.99, "AI Pro": 14.99, Business: 19.99 },
  },
  cursor: {
    name: "Cursor",
    plans: { Pro: 9.99, "Pro+": 29.99, Ultra: 99.99 },
  },
  github: {
    name: "GitHub",
    plans: {
      "Copilot Individual": 4.99,
      "Copilot Pro": 9.99,
      "Copilot Business": 18.99,
    },
  },
  grok: {
    name: "Grok",
    plans: { Lite: 4.99, SuperGrok: 14.99 },
  },
  lovable: {
    name: "Lovable",
    plans: { Pro: 12.49, Business: 24.99 },
  },
  kimi: {
    name: "Kimi",
    plans: {
      Moderato: 9.49,
      Allegretto: 19.49,
      Allegro: 49.49,
      Vivace: 99.49,
    },
  },
};

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
};

const rateLimitStore = new Map();

const SECURITY_HEADERS = {
  "Content-Security-Policy": [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "img-src 'self' data: blob:",
    "font-src 'self' https://fonts.gstatic.com data:",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "script-src 'self'",
    "connect-src 'self' ws: wss:",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ].join("; "),
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  "Cache-Control": "no-store",
};

const safeLog = (message, context) => {
  const details = context ? ` ${JSON.stringify(context)}` : "";
  process.stderr.write(`[nitro-x-security] ${message}${details}\n`);
};

const json = (response, statusCode, payload) => {
  const body = JSON.stringify(payload);
  response.writeHead(statusCode, {
    ...SECURITY_HEADERS,
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
  });
  response.end(body);
};

const normalizeText = (value, maxLength = 160) =>
  typeof value === "string" ? value.trim().slice(0, maxLength) : "";

const getClientIp = (request) => {
  const forwardedFor = request.headers["x-forwarded-for"];

  if (typeof forwardedFor === "string" && forwardedFor.trim()) {
    return forwardedFor.split(",")[0].trim();
  }

  return request.socket.remoteAddress || "unknown";
};

const getRiskDetails = (isp = "") => ({
  riskLevel: HIGH_RISK_ISP_PATTERN.test(isp) ? "High Risk" : "Normal",
  isHighRisk: HIGH_RISK_ISP_PATTERN.test(isp),
});

const parseJsonBody = async (request) => {
  let raw = "";

  for await (const chunk of request) {
    raw += chunk;

    if (raw.length > 25_000) {
      throw new Error("Payload too large");
    }
  }

  if (!raw) {
    return {};
  }

  return JSON.parse(raw);
};

const isAllowedOrigin = (request) => {
  if (!ALLOWED_ORIGINS.length) {
    return true;
  }

  const origin = request.headers.origin;
  return typeof origin !== "string" || ALLOWED_ORIGINS.includes(origin);
};

const applyRateLimit = (key, limit, windowMs) => {
  const now = Date.now();
  const current = rateLimitStore.get(key);

  if (!current || current.expiresAt <= now) {
    rateLimitStore.set(key, { count: 1, expiresAt: now + windowMs });
    return false;
  }

  if (current.count >= limit) {
    return true;
  }

  current.count += 1;
  return false;
};

const sanitizeMetadata = (metadata) => {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(metadata)
      .slice(0, 20)
      .map(([key, value]) => [
        normalizeText(key, 60),
        typeof value === "string" ? value.slice(0, 500) : value,
      ]),
  );
};

const fetchGeoDetails = async (ipAddress) => {
  const primaryUrl = `https://ipapi.co/${ipAddress}/json/`;
  const fallbackUrl = `https://ipwho.is/${ipAddress}`;

  const runFetch = async (url) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);

    try {
      const response = await fetch(url, {
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error("Geo provider failed");
      }

      return await response.json();
    } finally {
      clearTimeout(timeout);
    }
  };

  try {
    const data = await runFetch(primaryUrl);
    const isp = normalizeText(data.org || "Unknown ISP");
    const riskDetails = getRiskDetails(isp);

    return {
      countryCode: normalizeText(data.country_code || "INTL", 8).toUpperCase() || "INTL",
      countryName: normalizeText(data.country_name || "International"),
      city: normalizeText(data.city || "Unknown"),
      isp,
      ...riskDetails,
    };
  } catch {
    const data = await runFetch(fallbackUrl);
    const isp = normalizeText(data?.connection?.isp || data?.connection?.org || "Unknown ISP");
    const riskDetails = getRiskDetails(isp);

    return {
      countryCode: normalizeText(data.country_code || "INTL", 8).toUpperCase() || "INTL",
      countryName: normalizeText(data.country || "International"),
      city: normalizeText(data.city || "Unknown"),
      isp,
      ...riskDetails,
    };
  }
};

const maybeInsertSupabase = async (table, rows) => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return;
  }

  try {
    await fetch(`${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/${table}`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(rows),
    });
  } catch (error) {
    safeLog("Supabase write failed", { table, error: error instanceof Error ? error.message : "Unknown error" });
  }
};

const handleGeoRequest = async (request, response) => {
  const clientIp = getClientIp(request);

  if (applyRateLimit(`${clientIp}:geo`, 60, 60_000)) {
    return json(response, 429, { error: "Too many requests" });
  }

  try {
    const geo = await fetchGeoDetails(clientIp);
    return json(response, 200, geo);
  } catch {
    return json(response, 200, {
      countryCode: "INTL",
      countryName: "International",
      city: "Unknown",
      isp: "Unknown",
      riskLevel: "Normal",
      isHighRisk: false,
    });
  }
};

const handleTelemetryRequest = async (request, response) => {
  const clientIp = getClientIp(request);

  if (!isAllowedOrigin(request)) {
    return json(response, 403, { error: "Origin not allowed" });
  }

  if (applyRateLimit(`${clientIp}:telemetry`, 120, 60_000)) {
    return json(response, 429, { error: "Too many requests" });
  }

  try {
    const body = await parseJsonBody(request);
    const source = normalizeText(body.source || "event", 80) || "event";
    const eventLabel = normalizeText(body.eventLabel || source, 180) || source;

    await maybeInsertSupabase("user_logs", [
      {
        session_id: normalizeText(body.sessionId || "anonymous", 80) || "anonymous",
        ip_address: clientIp,
        country_code: normalizeText(body.countryCode || "", 8).toUpperCase() || null,
        country_name: normalizeText(body.countryName || "", 80) || null,
        city: normalizeText(body.city || "", 80) || null,
        isp: normalizeText(body.isp || "", 120) || null,
        risk_level:
          body.isHighRisk || body.riskLevel === "high" || body.riskLevel === "High Risk"
            ? "High Risk"
            : "Normal",
        event_type: source,
        event_label: eventLabel,
        page_path: normalizeText(body.pagePath || "/", 180) || "/",
        metadata: sanitizeMetadata(body.metadata),
      },
    ]);

    return json(response, 202, { ok: true });
  } catch (error) {
    safeLog("Telemetry rejected", { ip: clientIp, error: error instanceof Error ? error.message : "Unknown error" });
    return json(response, 400, { error: "Unable to process telemetry" });
  }
};

const handleOrderRequest = async (request, response) => {
  const clientIp = getClientIp(request);

  if (!isAllowedOrigin(request)) {
    return json(response, 403, { error: "Origin not allowed" });
  }

  if (applyRateLimit(`${clientIp}:orders`, 20, 60_000)) {
    return json(response, 429, { error: "Too many order attempts" });
  }

  try {
    const body = await parseJsonBody(request);
    const platformId = normalizeText(body.platformId, 40);
    const planName = normalizeText(body.planName, 80);
    const paymentMethod = normalizeText(body.paymentMethod, 20);
    const deliveryMethod = normalizeText(body.deliveryMethod, 20);
    const customerEmail = normalizeText(body.customerEmail, 160).toLowerCase();
    const countryCode = normalizeText(body.countryCode || "INTL", 8).toUpperCase() || "INTL";
    const countryName = normalizeText(body.countryName || "International", 80) || "International";

    const catalogEntry = ORDER_CATALOG[platformId];
    const validatedAmount = catalogEntry?.plans?.[planName];
    const allowedPaymentMethods = !countryCode || countryCode === "INTL" || countryCode === "EG"
      ? ["vodafone", "crypto", "card"]
      : ["crypto", "card"];

    if (!catalogEntry || typeof validatedAmount !== "number") {
      return json(response, 400, { error: "Invalid product or plan" });
    }

    if (!["own-account", "ready-made"].includes(deliveryMethod)) {
      return json(response, 400, { error: "Invalid delivery method" });
    }

    if (!allowedPaymentMethods.includes(paymentMethod)) {
      return json(response, 400, { error: "Payment method not allowed for this region" });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      return json(response, 400, { error: "Please enter a valid email address" });
    }

    const timestamp = new Date().toISOString();
    const order = {
      id: `ORD-${Date.now().toString().slice(-5)}${Math.floor(100 + Math.random() * 900)}`,
      platformId,
      platformName: catalogEntry.name,
      planName,
      amount: validatedAmount,
      paymentMethod,
      deliveryMethod,
      customerEmail,
      countryCode,
      countryName,
      submittedAt: timestamp,
      updatedAt: timestamp,
    };

    await maybeInsertSupabase("user_logs", [
      {
        session_id: normalizeText(body.sessionId || "anonymous", 80) || "anonymous",
        ip_address: clientIp,
        country_code: countryCode,
        country_name: countryName,
        event_type: "order_validated",
        event_label: `Secure order validated: ${platformId}/${planName}`,
        page_path: "/checkout",
        metadata: {
          orderId: order.id,
          platformId,
          planName,
          paymentMethod,
          deliveryMethod,
          validatedAmount,
        },
      },
    ]);

    return json(response, 200, { order });
  } catch (error) {
    safeLog("Order validation failed", { ip: clientIp, error: error instanceof Error ? error.message : "Unknown error" });
    return json(response, 400, { error: "Unable to validate order right now" });
  }
};

const serveStaticAsset = async (request, response) => {
  const requestUrl = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
  const requestedPath = requestUrl.pathname === "/" ? "/index.html" : requestUrl.pathname;
  const assetPath = path.join(DIST_DIR, path.normalize(requestedPath).replace(/^([.][.][/\\])+/, ""));
  const filePath = existsSync(assetPath) ? assetPath : path.join(DIST_DIR, "index.html");

  try {
    const file = await readFile(filePath);
    const extension = path.extname(filePath).toLowerCase();

    response.writeHead(200, {
      ...SECURITY_HEADERS,
      "Content-Type": MIME_TYPES[extension] || "application/octet-stream",
      "Cache-Control": extension === ".html" ? "no-store" : "public, max-age=31536000, immutable",
    });
    response.end(file);
  } catch {
    json(response, 404, { error: "Not found" });
  }
};

const server = createServer(async (request, response) => {
  const requestUrl = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);

  if (request.method === "GET" && requestUrl.pathname === "/api/health") {
    return json(response, 200, { ok: true });
  }

  if (request.method === "GET" && requestUrl.pathname === "/api/geo") {
    return handleGeoRequest(request, response);
  }

  if (request.method === "POST" && requestUrl.pathname === "/api/telemetry") {
    return handleTelemetryRequest(request, response);
  }

  if (request.method === "POST" && requestUrl.pathname === "/api/orders") {
    return handleOrderRequest(request, response);
  }

  if (existsSync(DIST_DIR)) {
    return serveStaticAsset(request, response);
  }

  return json(response, 404, { error: "Build output not found. Run npm run build first." });
});

server.listen(PORT, () => {
  process.stdout.write(`Secure NITRO X server running on http://localhost:${PORT}\n`);
});
