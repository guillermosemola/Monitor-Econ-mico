export default async (req) => {
  const url = new URL(req.url);
  const target = url.searchParams.get("url");

  if (!target) {
    return new Response(JSON.stringify({ error: "Missing url param" }), {
      status: 400
    });
  }

  const allowed = ["api.bcra.gob.ar", "dolarapi.com"];
  let targetHost;
  try {
    targetHost = new URL(target).hostname;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid URL" }), { status: 400 });
  }

  if (!allowed.includes(targetHost)) {
    return new Response(JSON.stringify({ error: "Domain not allowed" }), { status: 403 });
  }

  try {
    const resp = await fetch(target, { headers: { Accept: "application/json" } });
    const text = await resp.text();
    return new Response(text, {
      status: resp.status,
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};

export const config = {
  path: "/.netlify/functions/proxy"
};

