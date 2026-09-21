"use client";

import { useState } from "react";
import { developerExamples } from "@/lib/astra-track";

export function AstraDeveloperCorner() {
  const [message, setMessage] = useState("");
  return <details className="operator-block astra-detail astra-developer" id="astra-developer">
    <summary>Developer corner · optional API implementation details</summary>
    <p>Nontechnical learners can skip this section. These adapted examples were checked against official documentation on 2026-09-06 and syntax-tested locally; no paid API call was made. They are not complete production applications. Access, limits, supported parameters and billing are changing; inspect the current source before running code.</p>
    <p>Use server-side credentials, spending limits and scoped tools. Supported Astra effort levels are low, medium, high, xhigh and max; do not copy a product’s selector label into an API parameter. Code here configures or illustrates a request—it does not execute it in this browser.</p>
    {developerExamples.map((example, index) => <section key={example.title} aria-labelledby={`astra-code-title-${index}`}>
      <h4 id={`astra-code-title-${index}`}>{example.title}</h4>
      <p>{example.note}</p><strong>{example.language}</strong>
      <pre tabIndex={0} aria-label={`${example.language} example: ${example.title}`}><code>{example.code}</code></pre>
      <div className="studio-toolbar"><button className="astra-download" type="button" onClick={async () => {
        try { await navigator.clipboard.writeText(example.code); setMessage(`${example.title} copied. Replace placeholders and review current API requirements before running.`); }
        catch { setMessage("Clipboard permission is unavailable. Select and copy the code manually."); }
      }}>Copy {example.title}</button><a href={example.source} target="_blank" rel="noreferrer">Official documentation<span className="sr-only"> (opens in a new tab)</span></a></div>
    </section>)}
    <p role="status">{message}</p>
  </details>;
}
