export default async function handler(req, res) {
  const { endpoint } = req.query;

  const today = new Date();
  const yearAgo = new Date(today);
  yearAgo.setFullYear(yearAgo.getFullYear() - 1);
  const desde = yearAgo.toISOString();
  const hasta = today.toISOString();

  const bcraBase = "https://api.bcra.gob.ar/estadisticas/v4.0/Monetarias";

  const endpoints = {
    dolares:       "https://dolarapi.com/v1/dolares",
    ipc:           `${bcraBase}/27?Desde=${desde}&Hasta=${hasta}&Limit=500`,
    ipcInteranual: `${bcraBase}/28?Desde=${desde}&Hasta=${hasta}&Limit=500`,
    badlar:        `${bcraBase}/7?Desde=${desde}&Hasta=${hasta}&Limit=500`,
    reservas:      `${bcraBase}/1?Desde=${desde}&Hasta=${hasta}&Limit=500`,
    tem:           `${bcraBase}/12?Desde=${desde}&Hasta=${hasta}&Limit=500`,
    riesgoPais:    "https://api.argentinadatos.com/v1/finanzas/indices/riesgo-pais",
  };

  if (!endpoint || !endpoints[endpoint]) {
    return res.status(400).json({ error: "Invalid endpoint" });
  }

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=300");

  try {
    const response = await fetch(endpoints[endpoint], {
      headers: { Accept: "application/json" }
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({
        error: `Upstream ${response.status}`,
        detail: text.slice(0, 300)
      });
    }

    const json = await response.json();

    let normalized;
    if (endpoint === 'dolares') {
      normalized = json;
    } else if (endpoint === 'riesgoPais') {
      // argentinadatos devuelve [{fecha, valor}] — mismo formato que BCRA
      normalized = { results: Array.isArray(json) ? json : [] };
    } else {
      const detalle = json?.results?.[0]?.detalle || [];
      normalized = { results: detalle };
    }

    res.status(200).json(normalized);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
