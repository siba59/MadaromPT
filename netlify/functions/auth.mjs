import crypto from "crypto";

export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const password = process.env.APP_PASSWORD;
  const sessionSecret = process.env.SESSION_SECRET;

  if (!password || !sessionSecret) {
    return new Response(
      JSON.stringify({ errore: "Configurazione server mancante" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ errore: "JSON non valido" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (body.controlla === true) {
    return new Response(
      JSON.stringify({ ok: false }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  if (body.password !== password) {
    return new Response(
      JSON.stringify({ errore: "Password errata" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const scadenza = Date.now() + 8 * 60 * 60 * 1000;
  const payload = Buffer.from(JSON.stringify({ scadenza })).toString("base64");
  const firma = crypto.createHmac("sha256", sessionSecret).update(payload).digest("hex");
  const token = `${payload}.${firma}`;

  return new Response(
    JSON.stringify({ ok: true }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": `madarom_auth=${token}; HttpOnly; Path=/; Max-Age=${8 * 60 * 60}; SameSite=Lax`
      }
    }
  );
};
