const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
};

function getAllowedOrigins(env) {
  const raw = (env.ALLOWED_ORIGINS || "").trim();
  if (!raw) {
    return [];
  }
  return raw.split(",").map((item) => item.trim()).filter(Boolean);
}

function getCorsHeaders(origin, allowedOrigins) {
  if (!origin || !allowedOrigins.includes(origin)) {
    return {};
  }
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "86400",
    vary: "Origin",
  };
}

function jsonResponse(status, payload, corsHeaders = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...JSON_HEADERS,
      ...corsHeaders,
    },
  });
}

async function handleReviewRequest(request, env, corsHeaders) {
  if (!env.ENGINEERING_INTELLIGENCE_BACKEND_URL || !env.ENGINEERING_INTELLIGENCE_BACKEND_TOKEN) {
    return jsonResponse(500, { error: "Server backend is not configured." }, corsHeaders);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(400, { error: "Invalid JSON body." }, corsHeaders);
  }

  const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
  if (!prompt) {
    return jsonResponse(400, { error: "Field 'prompt' is required." }, corsHeaders);
  }
  if (prompt.length > 12000) {
    return jsonResponse(413, { error: "Prompt is too large." }, corsHeaders);
  }

  const upstream = await fetch(`${env.ENGINEERING_INTELLIGENCE_BACKEND_URL}/review`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${env.ENGINEERING_INTELLIGENCE_BACKEND_TOKEN}`,
    },
    body: JSON.stringify({
      prompt,
      context: body?.context || {},
      metadata: body?.metadata || {},
    }),
  });

  if (!upstream.ok) {
    return jsonResponse(502, { error: "Upstream review service failed." }, corsHeaders);
  }

  let upstreamJson;
  try {
    upstreamJson = await upstream.json();
  } catch {
    return jsonResponse(502, { error: "Upstream response was not JSON." }, corsHeaders);
  }

  return jsonResponse(200, upstreamJson, corsHeaders);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const allowedOrigins = getAllowedOrigins(env);
    const origin = request.headers.get("origin") || "";
    const corsHeaders = getCorsHeaders(origin, allowedOrigins);

    if (url.pathname === "/api/review" && request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (url.pathname === "/api/review" && request.method === "POST") {
      return handleReviewRequest(request, env, corsHeaders);
    }

    if (url.pathname === "/api/ping" && request.method === "GET") {
      return jsonResponse(200, { status: "ok" }, corsHeaders);
    }

    return env.ASSETS.fetch(request);
  },
};