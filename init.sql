CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  nota_geral INTEGER NOT NULL,
  nivel TEXT NOT NULL,
  clareza INTEGER NOT NULL,
  comercial INTEGER NOT NULL,
  tempo INTEGER NOT NULL,
  aquisicao INTEGER NOT NULL,
  entrega INTEGER NOT NULL,
  financeiro INTEGER NOT NULL,
  equipe INTEGER NOT NULL,
  ponto_forte TEXT NOT NULL,
  maior_gargalo TEXT NOT NULL,
  respostas_json JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
