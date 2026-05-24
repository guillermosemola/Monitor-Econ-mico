export default async (req) => {
  const url = new URL(req.url);
  const endpoint = url.searchParams.get("endpoint");

  const endpoints = {
    // Dólar — dolarapi
    dolares: "https://dolarapi.com/v1/dolares",
    // BCRA stats — usando ambito como respaldo
    ipc:           "https://api.bcra.gob.ar/estadisticas/v3.0/datosvariable/31/2025-05-24/2026-05-24",
    ipcInteranual: "https://api.bcra.gob.ar/estadisticas/v3.0/datosvariable/30/2025-05-24/2026-05-24",
    tem:           "https://api.bcra.gob.ar/estadisticas/v3.0/datosvariable/27/2025-05-24/2026-05-24",
    badlar:        "https://api.bcra.gob.ar/estadisticas/v3.0/datosvariable/28/2025-05-24/2026-05-24",
    riesgoPais:    "https://api.bcra.gob.ar/estadisticas/v3.0/datosvariable/29/2025-05-24/2026-05-24",
    reservas:      "https://api.bcra.gob.ar/estadisticas/v3.0/datosvariable/6/2025-05-24/2026-05-24",
  };

  if (!endpoint || !endpoints[endpoint]) {
    return new Response(JSON.stringify({ error: "Invalid endpoint" }), { status: 400 });
  }

  try {
    const resp = await fetch(endpoints[endpoint], {
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; monitor-economico/1.0)"
      }
    });
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
