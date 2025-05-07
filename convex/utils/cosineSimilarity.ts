export function cosineSimilarity(a: number[], b: number[]) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return 0;
  const dot = a.reduce((acc, val, i) => acc + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((acc, val) => acc + val * val, 0));
  const normB = Math.sqrt(b.reduce((acc, val) => acc + val * val, 0));
  return dot / (normA * normB);
}
