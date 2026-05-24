export default async function handler(req, res) {
  const { endpoint } = req.query;

  const today = new Date();
  const yearAgo = new Date(today);
  yearAgo.setFullYear(yearAgo.getFullYear() - 1);
  const desde = yearAgo.toISOString();
  const hasta = today.toISOString();

  const bcraBase = "https://api.bcra.gob.ar/estadisticas/v4.0/Monetarias";

  // Endpoint especial para descubrir IDs
  if (endpoint === 'list') {
    try {
      const r = await fetch(`${bcraBase}?Limit=200`, { headers: { Accept: "application/json" } });
      const j = await r.json();
      res.setHeader("Access-Control-Allow-Origin", "*");
      return res.status(200).json(j);
    } catch(e) {
      return res.status(500).json({ error: e.message });
    }
  }

  const endpoints = {
    dolares:       "https://dolarapi.com/v1/dolares",
    ipc:           `${bcraBase}/31?Desde=${desde}&Hasta=${hasta}&Limit=500`,
    ipcInteranual: `${bcraBase}/30?Desde=${desde}&Hasta=${hasta}&Limit=500`,
    tem:           `${bcraBase}/27?Desde=${desde}&Hasta=${hasta}&Limit=500`,
    badlar:        `${bcraBase}/28?Desde=${desde}&Hasta=${hasta}&Limit=500`,
    riesgoPais:    `${bcraBase}/29?Desde=${desde}&Hasta=${hasta}&Limit=500`,
    reservas:      `${bcraBase}/6?Desde=${desde}&Hasta=${hasta}&Limit=500`,
  };

  if (!endpoint || !endpoints[endpoint]) {
    return res.status(400).json({ error: "Invalid endpoint" });
  }

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=300");

  try {
    const response = await fetch(endpoints[endpoint], { headers: { Accept: "application/json" } });
    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: `Upstream ${response.status}`, detail: text.slice(0,300) });
    }
    const json = await response.json();
    const detalle = json?.results?.[0]?.detalle || [];
    res.status(200).json({ results: detalle });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
