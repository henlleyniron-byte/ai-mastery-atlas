/**
 * A dated, vendor-linked reference only.
 * This component never calls a model, requests credentials, or assumes an entitlement.
 * Verify the vendor catalogs before updating its date or descriptions.
 */
const families = [
  {
    vendor: "OpenAI",
    models: "GPT-6 Astra · GPT-6.1 Sol · GPT-6.1 Terra",
    role: "Compare maximum-depth reasoning, balanced complex work and efficient visual or computer-use tasks. Pick from demonstrated task quality, available access and cost.",
    url: "https://developers.openai.com/api/docs/models",
  },
  {
    vendor: "Anthropic",
    models: "Claude Opus 5.5 · Sonnet 5.5 · Haiku 5.5",
    role: "Compare demanding knowledge or coding work, broad everyday work and high-throughput smaller-model tasks. Specialist releases may have separate access.",
    url: "https://www.anthropic.com/news/models",
  },
  {
    vendor: "Google",
    models: "Gemini 4 Argon · Gemini 3.8 Flash",
    role: "Compare flagship reasoning and fast engineering or agent tasks; stable API model IDs, consumer-app menus and region access can differ.",
    url: "https://ai.google.dev/gemini-api/docs/models",
  },
] as const;

export function ModelCurrencyPanel() {
  return (
    <section id="model-currency" className="page-section compact-section" aria-labelledby="model-currency-title">
      <div className="section-kicker">Vendor model reference · checked 2 November 2026</div>
      <h2 id="model-currency-title" className="section-title">Choose a capable model, then prove the result.</h2>
      <p className="section-intro">
        This dated reference connects current model families to the Atlas's durable routing method.
        A more recent release is not automatically better for your actual task: test accuracy,
        citation fidelity, latency, cost and availability on unchanged examples.
      </p>
      <div className="boundary-grid">
        {families.map((family) => (
          <article key={family.vendor}>
            <h3>{family.vendor}</h3>
            <p><strong>{family.models}</strong></p>
            <p>{family.role}</p>
            <p>
              <a href={family.url} target="_blank" rel="noopener noreferrer">
                Official model documentation <span className="sr-only">(opens in a new tab)</span>
              </a>
            </p>
          </article>
        ))}
      </div>
      <p className="section-intro">
        This is educational catalog information, not a live model selector, connected API,
        purchase, or proof of account entitlement. Check vendor documentation again before
        deployment, and use a frozen task rubric before changing a working production model.
      </p>
    </section>
  );
}
