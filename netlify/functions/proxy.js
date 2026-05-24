export default async (req) => {
  const url = new URL(req.url);
  const endpoint = url.searchParams.get("endpoint");
 
  // Fechas dinámicas - siempre últimos 12 meses
  const today = new Date();
  const yearAgo = new Date(today);
  yearAgo.setFullYear(yearAgo.getFullYear() - 1);
  const fmt = d => d.toISOString().split("T")[0];
  const desde = fmt(yearAgo);
  const hasta = fmt(today);
 
  // api.estadisticasbcra.com — sin restricciones CORS, con token público
  // Los endpoints devuelven array de {d: "YYYY-MM-DD", v: number}
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
    return new Response(JSON.stringify({ error: "Invalid endpoint" }), { status: 400 });
  }
 
  try {
    const resp = await fetch(endpoints[endpoint], {
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; monitor/1.0)"
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
