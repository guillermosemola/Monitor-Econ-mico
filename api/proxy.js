export default async function handler(req, res) {
  const { endpoint } = req.query;

  const today = new Date();
  const yearAgo = new Date(today);
  yearAgo.setFullYear(yearAgo.getFullYear() - 1);
  const fmt = d => d.toISOString().split("T")[0];
  const desde = fmt(yearAgo);
  const hasta = fmt(today);

  const endpoints = {
    dolares:       "https://dolarapi.com/v1/dolares",
    ipc:           `https://api.estadisticasbcra.com/ipc_ng_mensual?desde=${desde}&hasta=${hasta}`,
    ipcInteranual: `https://api.estadisticasbcra.com/ipc_ng_interanual?desde=${desde}&hasta=${hasta}`,
    tem:           `https://api.estadisticasbcra.com/tasa_politica_monetaria?desde=${desde}&hasta=${hasta}`,
    badlar:        `https://api.estadisticasbcra.com/tasa_badlar?desde=${desde}&hasta=${hasta}`,
    riesgoPais:    `https://api.estadisticasbcra.com/riesgo_pais?desde=${desde}&hasta=${hasta}`,
    reservas:      `https://api.estadisticasbcra.com/reservas?desde=${desde}&hasta=${hasta}`,
  };

  if (!endpoint || !endpoints[endpoint]) {
    return res.status(400).json({ error: "Invalid endpoint" });
  }

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=300");

  try {
    const response = await fetch(endpoints[endpoint], {
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; monitor-economico/1.0)"
      }
    });
    const data = await response.text();
    res.setHeader("Content-Type", "application/json");
    res.status(response.status).send(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

