import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/** Summarizes investments into asset-class allocation percentages */
function summarizeAllocations(investments) {
  const values = investments.map((i) => ({
    assetClass: i.asset_class,
    value: Number(i.quantity) * Number(i.unit_price),
  }));
  const total = values.reduce((sum, v) => sum + v.value, 0);

  const byAssetClass = {};
  for (const { assetClass, value } of values) {
    byAssetClass[assetClass] = (byAssetClass[assetClass] ?? 0) + value;
  }

  return Object.entries(byAssetClass).map(([assetClass, value]) => ({
    assetClass,
    percentage: total > 0 ? Math.round((value / total) * 100) : 0,
  }));
}

function buildPrompt({ allocations, goals, age }) {
  const allocationText = allocations.length
    ? allocations.map((a) => `${a.assetClass}: ${a.percentage}%`).join(", ")
    : "no current investments";

  const goalsText = goals.length
    ? goals
        .map(
          (g) =>
            `"${g.name}" (target: $${g.target_amount} by ${g.target_date})`,
        )
        .join("; ")
    : "no specific goal on file";

  const ageText = age != null ? `${age} years old` : "an unknown age";

  return `You are assisting a financial advisor. The client is ${ageText}.
Current portfolio allocation: ${allocationText}.
Client goal(s): ${goalsText}.

Write a short (2-4 sentence) note addressed to the advisor, not the client. Flag whether the current allocation fits the goal's time horizon, suggest a rebalance direction if appropriate, and reference the goal's target date/amount where relevant.`;
}

/** Calls the Anthropic API to draft a short advisor-facing recommendation note */
export async function generateRecommendationDraft({ investments, goals, age }) {
  const allocations = summarizeAllocations(investments);
  const prompt = buildPrompt({ allocations, goals, age });

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 300,
    messages: [{ role: "user", content: prompt }],
  });

  return response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("")
    .trim();
}
