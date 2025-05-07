import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../convex/_generated/api";

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [results, setResults] = useState<any[] | null>(null);
  const searchProducts = useAction(api.search.searchProducts);

  const handleSearch = async () => {
    if (prompt) {
      const res = await searchProducts({ prompt });
      setResults(res);
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Trova il prodotto perfetto</h1>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Es: scarpe impermeabili da trekking"
          className="flex-1 border p-2 rounded"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Cerca
        </button>
      </div>

      {results && (
        <div className="grid gap-4">
          {results.map((product) => (
            <div key={product._id} className="border p-4 rounded shadow">
              <img src={product.imageUrl} alt={product.title} className="w-full h-40 object-contain mb-2" />
              <h2 className="font-semibold">{product.title}</h2>
              <p className="text-sm text-gray-600">{product.description}</p>
              <p className="text-xs text-gray-400 mt-1">Similarità: {product.similarity.toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}