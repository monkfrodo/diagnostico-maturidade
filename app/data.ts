export type Dimension = {
  id: string;
  name: string;
  icon: string;
  questions: {
    text: string;
    options: { label: string; value: number }[];
  }[];
};

export type Level = {
  max: number;
  name: string;
  color: string;
  desc: string;
};

export const DIMENSIONS: Dimension[] = [
  {
    id: "clareza",
    name: "Clareza de Oferta",
    icon: "◎",
    questions: [
      {
        text: "Se alguém te perguntar o que você vende, você consegue explicar em uma frase — e a pessoa entende?",
        options: [
          { label: "Nem eu sei direito", value: 1 },
          { label: "Consigo, mas a pessoa fica confusa", value: 2 },
          { label: "Explico bem, mas mudo a cada semana", value: 3 },
          { label: "Sim, qualquer pessoa entende na hora", value: 4 },
        ],
      },
      {
        text: "Quantas ofertas diferentes você tem ativas hoje?",
        options: [
          { label: "Perdi a conta", value: 1 },
          { label: "Mais de 5", value: 2 },
          { label: "2 a 4 ofertas", value: 3 },
          { label: "1 a 2 ofertas bem definidas", value: 4 },
        ],
      },
    ],
  },
  {
    id: "comercial",
    name: "Estrutura Comercial",
    icon: "⬡",
    questions: [
      {
        text: "Como funciona seu processo de vendas hoje?",
        options: [
          { label: "Não tenho processo, vendo quando aparece", value: 1 },
          { label: "Posto conteúdo e torço pra alguém comprar", value: 2 },
          { label: "Tenho um funil, mas não sei se funciona", value: 3 },
          { label: "Tenho um processo claro com etapas definidas", value: 4 },
        ],
      },
      {
        text: "Você sabe exatamente quanto custa adquirir um cliente (CAC)?",
        options: [
          { label: "Não faço ideia", value: 1 },
          { label: "Tenho um chute", value: 2 },
          { label: "Sei mais ou menos", value: 3 },
          { label: "Sei o número e acompanho", value: 4 },
        ],
      },
    ],
  },
  {
    id: "tempo",
    name: "Gestão de Tempo",
    icon: "◈",
    questions: [
      {
        text: "Quantas horas por semana você trabalha no operacional (entrega, suporte, conteúdo)?",
        options: [
          { label: "Todas. Eu sou o operacional.", value: 1 },
          { label: "Mais de 40h", value: 2 },
          { label: "20 a 40h", value: 3 },
          { label: "Menos de 20h, o resto é estratégia", value: 4 },
        ],
      },
      {
        text: "Se você parar de trabalhar por 30 dias, o que acontece com seu faturamento?",
        options: [
          { label: "Zera completamente", value: 1 },
          { label: "Cai mais de 70%", value: 2 },
          { label: "Cai uns 30-50%", value: 3 },
          { label: "Quase nada muda", value: 4 },
        ],
      },
    ],
  },
  {
    id: "aquisicao",
    name: "Aquisição de Clientes",
    icon: "◇",
    questions: [
      {
        text: "De onde vêm seus clientes hoje?",
        options: [
          { label: "Não sei, aparecem do nada", value: 1 },
          { label: "Só de indicação ou boca a boca", value: 2 },
          { label: "De 1-2 canais, mas sem previsibilidade", value: 3 },
          {
            label: "De canais definidos com métricas e previsibilidade",
            value: 4,
          },
        ],
      },
      {
        text: "Você consegue prever quantos clientes novos vai ter no próximo mês?",
        options: [
          { label: "Não, é sempre surpresa", value: 1 },
          { label: "Tenho uma noção vaga", value: 2 },
          { label: "Consigo estimar com margem grande de erro", value: 3 },
          { label: "Sim, tenho previsibilidade razoável", value: 4 },
        ],
      },
    ],
  },
  {
    id: "entrega",
    name: "Entrega e Retenção",
    icon: "△",
    questions: [
      {
        text: "Seus clientes voltam a comprar de você?",
        options: [
          { label: "Quase nunca", value: 1 },
          { label: "Alguns, por acaso", value: 2 },
          { label: "Sim, mas não tenho estratégia pra isso", value: 3 },
          { label: "Sim, tenho upsell/retenção estruturados", value: 4 },
        ],
      },
      {
        text: "Você coleta feedback dos seus clientes de forma sistemática?",
        options: [
          { label: "Nunca pedi feedback", value: 1 },
          { label: "Às vezes pergunto informalmente", value: 2 },
          { label: "Peço, mas não faço nada com isso", value: 3 },
          { label: "Coleto e uso pra melhorar minha entrega", value: 4 },
        ],
      },
    ],
  },
  {
    id: "financeiro",
    name: "Saúde Financeira",
    icon: "□",
    questions: [
      {
        text: "Você sabe sua margem de lucro real (descontando tudo)?",
        options: [
          { label: "Não controlo nada", value: 1 },
          { label: "Sei o faturamento, mas não o lucro", value: 2 },
          { label: "Tenho uma noção, mas não é preciso", value: 3 },
          { label: "Sei exatamente e acompanho mensalmente", value: 4 },
        ],
      },
      {
        text: "Quanto do seu faturamento depende de lançamentos ou picos sazonais?",
        options: [
          { label: "100% — sem lançamento, não fatura", value: 1 },
          { label: "Mais de 70%", value: 2 },
          { label: "30 a 50%", value: 3 },
          { label: "Menos de 30%, tenho receita recorrente", value: 4 },
        ],
      },
    ],
  },
  {
    id: "equipe",
    name: "Equipe e Operação",
    icon: "⬢",
    questions: [
      {
        text: "Quem executa o trabalho do dia a dia no seu negócio?",
        options: [
          { label: "Só eu. Tudo.", value: 1 },
          { label: "Eu e um freelancer aqui e ali", value: 2 },
          { label: "Tenho pessoas, mas sem funções claras", value: 3 },
          {
            label: "Tenho equipe com papéis e responsabilidades definidos",
            value: 4,
          },
        ],
      },
      {
        text: "Seus processos estão documentados? Se alguém novo entrasse, saberia o que fazer?",
        options: [
          { label: "Nada documentado, tá tudo na minha cabeça", value: 1 },
          { label: "Tenho algumas anotações soltas", value: 2 },
          { label: "Principais processos estão registrados", value: 3 },
          { label: "Sim, tenho processos claros e treináveis", value: 4 },
        ],
      },
    ],
  },
];

export const LEVELS: Level[] = [
  {
    max: 25,
    name: "Sobrevivência",
    color: "#C0392B",
    desc: "Seu negócio é basicamente um emprego disfarçado — e dos ruins. Você está trocando tempo por dinheiro sem estrutura, sem previsibilidade e sem clareza. A boa notícia: consciência é o primeiro passo.",
  },
  {
    max: 50,
    name: "Tração",
    color: "#D4731A",
    desc: "Você já tem algo funcionando, mas está preso no operacional e dependente de você pra tudo. O negócio cresce quando você empurra e para quando você para. É hora de parar de improvisar e construir fundamentos.",
  },
  {
    max: 75,
    name: "Estruturação",
    color: "#2E7D32",
    desc: "Você tem um negócio de verdade se formando. Algumas peças já funcionam, mas ainda falta consistência e integração. O próximo passo não é mais tática — é engenharia de negócio.",
  },
  {
    max: 100,
    name: "Maturidade",
    color: "#1A5276",
    desc: "Seu negócio tem estrutura, previsibilidade e não depende só de você. Isso é raro. O desafio agora é escalar sem perder a essência e manter a clareza que te trouxe até aqui.",
  },
];

export function getLevel(score: number) {
  return LEVELS.find((l) => score <= l.max) || LEVELS[LEVELS.length - 1];
}

export function getBarColor(value: number): string {
  if (value <= 25) return "#C0392B";
  if (value <= 50) return "#D4731A";
  if (value <= 75) return "#2E7D32";
  return "#1A5276";
}

export type Scores = Record<string, number>;
export type Answers = Record<string, number>;

export function calculateScores(answers: Answers): Scores {
  const scores: Scores = {};
  for (const dim of DIMENSIONS) {
    const q1 = answers[`${dim.id}_0`] || 0;
    const q2 = answers[`${dim.id}_1`] || 0;
    scores[dim.id] = Math.round(((q1 + q2) / 8) * 100);
  }
  return scores;
}

export function calculateOverall(scores: Scores): number {
  const vals = Object.values(scores);
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

export function getStrongest(scores: Scores): { name: string; value: number } {
  let best = { id: "", value: 0 };
  for (const [id, val] of Object.entries(scores)) {
    if (val > best.value) best = { id, value: val };
  }
  const dim = DIMENSIONS.find((d) => d.id === best.id);
  return { name: dim?.name || "", value: best.value };
}

export function getWeakest(scores: Scores): { name: string; value: number } {
  let worst = { id: "", value: 101 };
  for (const [id, val] of Object.entries(scores)) {
    if (val < worst.value) worst = { id, value: val };
  }
  const dim = DIMENSIONS.find((d) => d.id === worst.id);
  return { name: dim?.name || "", value: worst.value };
}
