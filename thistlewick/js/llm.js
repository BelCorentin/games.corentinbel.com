// In-browser language model (WebLLM on WebGPU). Optional: the game is fully playable without it.
const WEBLLM_URL = "https://esm.run/@mlc-ai/web-llm@0.2.86";

export const MODELS = [
  { id: "Llama-3.2-1B-Instruct", label: "Normal (Llama 3.2 1B, ~0.9 GB)" },
  { id: "Qwen2.5-0.5B-Instruct", label: "Light (Qwen 2.5 0.5B, ~0.4 GB)" },
  { id: "Llama-3.2-3B-Instruct", label: "Rich (Llama 3.2 3B, ~2.3 GB)" },
];

let engine = null;
let busy = false;

export const hasWebGPU = () => typeof navigator !== "undefined" && !!navigator.gpu;
export const ready = () => !!engine;

export async function load(baseId, onProgress) {
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) throw new Error("No WebGPU adapter");
  const f16 = adapter.features.has("shader-f16");
  const modelId = `${baseId}-${f16 ? "q4f16_1" : "q4f32_1"}-MLC`;
  const webllm = await import(WEBLLM_URL);
  engine = await webllm.CreateMLCEngine(modelId, {
    initProgressCallback: (r) => onProgress?.(r.progress ?? 0, r.text ?? ""),
  });
  return modelId;
}

function clean(s, maxSentences = 2) {
  s = s.replace(/^\s*["'“]?[A-Z][a-zA-Z ()]{0,24}:\s*/, "").replace(/\s+/g, " ").trim();
  s = s.replace(/^["“]|["”]$/g, "");
  const parts = s.match(/[^.!?]+[.!?]+["”']?|[^.!?]+$/g) || [s];
  return parts.slice(0, maxSentences).join(" ").trim();
}

// Free conversation, constrained to what the character has already said.
export async function smallTalk({ persona, context, known, history, player, dog }) {
  if (!engine || busy) return null;
  busy = true;
  try {
    const sys = dog
      ? `${persona}\n${context}\nThe dog never speaks words. Reply with one short action in asterisks, for example: *Bramble wags his tail.*`
      : `You are ${persona}\n${context}\n` +
        `What you know about Wren's disappearance (ONLY these facts, never invent new places, people, objects or events):\n` +
        (known.length ? known.map((k) => `- ${k}`).join("\n") : "- Nothing yet beyond what everyone knows: she is missing.") +
        `\nIf Moss asks about something you don't know, say you don't know, in character. ` +
        `Talk to Moss directly. Reply in one or two short sentences of plain spoken English. No narration, no quotes, no lists.`;
    const messages = [{ role: "system", content: sys }];
    for (const h of history.slice(-6)) messages.push({ role: h.who === "you" ? "user" : "assistant", content: h.text });
    messages.push({ role: "user", content: player });
    const r = await engine.chat.completions.create({ messages, max_tokens: 70, temperature: 0.7, top_p: 0.9 });
    const out = clean(r.choices[0].message.content || "", dog ? 1 : 2);
    return out || null;
  } catch (e) {
    console.warn("LLM error", e);
    return null;
  } finally {
    busy = false;
  }
}
