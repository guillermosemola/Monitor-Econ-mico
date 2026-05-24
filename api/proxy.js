export default async function handler(req, res) {
  const { endpoint } = req.query;

  const today = new Date();
  const yearAgo = new Date(today);
  yearAgo.setFullYear(yearAgo.getFullYear() - 1);
  const desde = yearAgo.toISOString();
  const hasta = today.toISOString();

  const bcraBase = "https://api.bcra.gob.ar/estadisticas/v4.0/Monetarias";

  // IDs correctos v4.0:
  // 1=Reservas, 7=BADLAR, 27=IPC mensual, 28=IPC interanual
  // Riesgo pais: via dolarapi
  // Tasa pases activos 1 día (reemplaza TEM): 164
  const endpoints = {
    dolares:       "https://dolarapi.com/v1/dolares",
    riesgoPais:    "https://dolarapi.com/v1/cotizaciones/riesgo-pais",
    ipc:           `${bcraBase}/27?Desde=${desde}&Hasta=${hasta}&Limit=500`,
    ipcInteranual: `${bcraBase}/28?Desde=${desde}&Hasta=${hasta}&Limit=500`,
    badlar:        `${bcraBase}/7?Desde=${desde}&Hasta=${hasta}&Limit=500`,
    reservas:      `${bcraBase}/1?Desde=${desde}&Hasta=${hasta}&Limit=500`,
    tem:           `${bcraBase}/12?Desde=${desde}&Hasta=${hasta}&Limit=500`,
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

    // dolarapi devuelve array directo, BCRA v4.0 devuelve {results:[{idVariable, detalle:[]}]}
    let normalized;
    if (endpoint === 'dolares' || endpoint === 'riesgoPais') {
      normalized = json;
    } else {
      const detalle = json?.results?.[0]?.detalle || [];
      normalized = { results: detalle };
    }

    res.status(200).json(normalized);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
