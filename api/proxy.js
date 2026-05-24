export default async function handler(req, res) {
  const { endpoint } = req.query;

  const today = new Date();
  const yearAgo = new Date(today);
  yearAgo.setFullYear(yearAgo.getFullYear() - 1);
  const fmt = d => d.toISOString().split("T")[0];
  const desde = fmt(yearAgo);
  const hasta = fmt(today);

  // BCRA API oficial — variables correctas
  // 27=TEM, 28=BADLAR, 29=RiesgoPais, 31=IPC mensual, 30=IPC interanual, 6=Reservas
  const bcraBase = "https://api.bcra.gob.ar/estadisticas/v3.0/datosvariable";
  const endpoints = {
    dolares:       "https://dolarapi.com/v1/dolares",
    ipc:           `${bcraBase}/31/${desde}/${hasta}`,
    ipcInteranual: `${bcraBase}/30/${desde}/${hasta}`,
    tem:           `${bcraBase}/27/${desde}/${hasta}`,
    badlar:        `${bcraBase}/28/${desde}/${hasta}`,
    riesgoPais:    `${bcraBase}/29/${desde}/${hasta}`,
    reservas:      `${bcraBase}/6/${desde}/${hasta}`,
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
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        "Origin": "https://www.bcra.gob.ar",
        "Referer": "https://www.bcra.gob.ar/"
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: `Upstream error ${response.status}`,
        endpoint,
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
