export default async function handler(req, res) {
  const { endpoint } = req.query;

  const today = new Date();
  const yearAgo = new Date(today);
  yearAgo.setFullYear(yearAgo.getFullYear() - 1);
  const fmt = d => d.toISOString().split("T")[0];
  const desde = fmt(yearAgo);
  const hasta = fmt(today);

  // BCRA API v4.0 (v3.0 deprecada 28/02/2026)
  // IDs variables: 27=TEM, 28=BADLAR, 29=RiesgoPais, 31=IPC mensual, 30=IPC interanual, 6=Reservas
  const bcraBase = "https://api.bcra.gob.ar/estadisticas/v4.0/Monetarias";
  const endpoints = {
    dolares:       "https://dolarapi.com/v1/dolares",
    ipc:           `${bcraBase}/31?desde=${desde}&hasta=${hasta}`,
    ipcInteranual: `${bcraBase}/30?desde=${desde}&hasta=${hasta}`,
    tem:           `${bcraBase}/27?desde=${desde}&hasta=${hasta}`,
    badlar:        `${bcraBase}/28?desde=${desde}&hasta=${hasta}`,
    riesgoPais:    `${bcraBase}/29?desde=${desde}&hasta=${hasta}`,
    reservas:      `${bcraBase}/6?desde=${desde}&hasta=${hasta}`,
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
      return res.status(response.status).json({
        error: `Upstream ${response.status}`,
        url: endpoints[endpoint]
      });
    }

    const data = await response.text();
    res.setHeader("Content-Type", "application/json");
    res.status(200).send(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
