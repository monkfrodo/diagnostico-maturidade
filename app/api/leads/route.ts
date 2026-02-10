import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

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

    // Save to Vercel Postgres and send to ConvertKit in parallel
    const [dbResult] = await Promise.allSettled([
      sql`
        INSERT INTO leads (
          nome, email, whatsapp, nota_geral, nivel,
          clareza, comercial, tempo, aquisicao, entrega,
          financeiro, equipe, ponto_forte, maior_gargalo, respostas_json
        ) VALUES (
          ${nome}, ${email}, ${whatsapp}, ${nota_geral}, ${nivel},
          ${clareza}, ${comercial}, ${tempo}, ${aquisicao}, ${entrega},
          ${financeiro}, ${equipe}, ${ponto_forte}, ${maior_gargalo},
          ${JSON.stringify(respostas_json)}
        )
      `,
      sendToConvertKit({
        email,
        nome,
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

async function sendToConvertKit(data: {
  email: string;
  nome: string;
  whatsapp: string;
  nota_geral: number;
  nivel: string;
  clareza: number;
  comercial: number;
  tempo: number;
  aquisicao: number;
  entrega: number;
  financeiro: number;
  equipe: number;
  ponto_forte: string;
  maior_gargalo: string;
}) {
  const apiKey = process.env.CONVERTKIT_API_KEY;
  const tagId = process.env.CONVERTKIT_TAG_ID;

  if (!apiKey) {
    console.warn("CONVERTKIT_API_KEY not set, skipping ConvertKit");
    return;
  }

  if (!tagId) {
    console.warn("CONVERTKIT_TAG_ID not set, skipping ConvertKit");
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
    console.error("ConvertKit error:", response.status, text);
  }
}
