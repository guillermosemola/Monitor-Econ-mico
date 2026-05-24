export default async function handler(req, res) {
  const { endpoint } = req.query;

  const today = new Date();
  const yearAgo = new Date(today);
  yearAgo.setFullYear(yearAgo.getFullYear() - 1);
  // v4.0 requiere formato date-time ISO completo
  const desde = yearAgo.toISOString();
  const hasta = today.toISOString();

  const bcraBase = "https://api.bcra.gob.ar/estadisticas/v4.0/Monetarias";
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
    const response = await fetch(endpoints[endpoint], {
      headers: { Accept: "application/json" }
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({
        error: `Upstream ${response.status}`,
        url: endpoints[endpoint],
        detail: text.slice(0, 200)
      });
    }

    const json = await response.json();

    // v4.0 devuelve: { results: [{ idVariable, detalle: [{fecha, valor}] }] }
    // Normalizamos a [{fecha, valor}] para que el frontend no cambie
    let normalized;
    if (endpoint === 'dolares') {
      normalized = json; // dolarapi ya viene bien
    } else {
      const detalle = json?.results?.[0]?.detalle || [];
      normalized = { results: detalle }; // {results: [{fecha, valor}]}
    }

    res.status(200).json(normalized);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
