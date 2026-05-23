export default async (req) => {
  const url = new URL(req.url);
  const target = url.searchParams.get("url");

  if (!target) {
    return new Response(JSON.stringify({ error: "Missing url param" }), {
      status: 400,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }

  const allowed = ["api.bcra.gob.ar", "dolarapi.com"];
  try {
    const targetHost = new URL(target).hostname;
    if (!allowed.some(d => targetHost === d || targetHost.endsWith("." + d))) {
      return new Response(JSON.stringify({ error: "Domain not allowed" }), {
        status: 403,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }
  } catch {
    return new Response(JSON.stringify({ error: "Invalid URL" }), {
      status: 400,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }

  try {
    const resp = await fetch(target, { headers: { Accept: "application/json" } });
    const text = await resp.text();
    return new Response(text, {
      status: resp.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=300"
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
};

export const config = { path: "/proxy" };
