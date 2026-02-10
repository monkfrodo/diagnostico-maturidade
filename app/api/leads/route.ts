import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isScore(val: unknown): val is number {
  return typeof val === "number" && val >= 0 && val <= 100;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      nome,
      email,
      whatsapp,
      nota_geral,
      nivel,
      clareza,
      comercial,
      tempo,
      aquisicao,
      entrega,
      financeiro,
      equipe,
      ponto_forte,
      maior_gargalo,
      respostas_json,
    } = body;

    // Server-side validation
    if (
      typeof nome !== "string" || !nome.trim() ||
      typeof email !== "string" || !isValidEmail(email) ||
      typeof whatsapp !== "string" || whatsapp.replace(/\D/g, "").length !== 11 ||
      !isScore(nota_geral) ||
      typeof nivel !== "string" ||
      !isScore(clareza) || !isScore(comercial) || !isScore(tempo) ||
      !isScore(aquisicao) || !isScore(entrega) || !isScore(financeiro) ||
      !isScore(equipe) ||
      typeof ponto_forte !== "string" ||
      typeof maior_gargalo !== "string" ||
      typeof respostas_json !== "object"
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid data" },
        { status: 400 }
      );
    }

    // Save to Postgres and send to Kit in parallel
    const [dbResult] = await Promise.allSettled([
      sql`
        INSERT INTO leads (
          nome, email, whatsapp, nota_geral, nivel,
          clareza, comercial, tempo, aquisicao, entrega,
          financeiro, equipe, ponto_forte, maior_gargalo, respostas_json
        ) VALUES (
          ${nome.trim()}, ${email.trim().toLowerCase()}, ${whatsapp},
          ${nota_geral}, ${nivel},
          ${clareza}, ${comercial}, ${tempo}, ${aquisicao}, ${entrega},
          ${financeiro}, ${equipe}, ${ponto_forte}, ${maior_gargalo},
          ${JSON.stringify(respostas_json)}
        )
      `,
      sendToKit({
        email: email.trim().toLowerCase(),
        nome: nome.trim(),
        whatsapp,
      }),
    ]);

    if (dbResult.status === "rejected") {
      console.error("DB save failed:", dbResult.reason);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function sendToKit(data: {
  email: string;
  nome: string;
  whatsapp: string;
}) {
  const apiKey = process.env.CONVERTKIT_API_KEY;
  const tagId = process.env.CONVERTKIT_TAG_ID;

  if (!apiKey || !tagId) {
    console.warn("Kit env vars not set, skipping");
    return;
  }

  const response = await fetch(
    `https://api.convertkit.com/v3/tags/${tagId}/subscribe`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        email: data.email,
        first_name: data.nome.split(" ")[0],
        fields: {
          whatsapp: data.whatsapp,
        },
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    console.error("Kit error:", response.status, text);
  }
}
