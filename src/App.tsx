import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [results, setResults] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const searchProducts = useAction(api.search.searchProducts);
  const allProducts = useQuery(api.products.getAllProducts) ?? [];

  const handleSearch = async () => {
    if (prompt) {
      setIsLoading(true);
      const res = await searchProducts({ prompt });
      setResults(res);
      setIsLoading(false);
    } else {
      setResults(null);
    }
  };

  return (
    <div className="p-4 mx-auto">
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
          className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer"
          disabled={isLoading}
        >
          {isLoading ? "Sto cercando..." : "Cerca"}
        </button>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {(results ?? allProducts).map((product) => (
          <div key={product._id} className="border p-4 rounded shadow">
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-40 object-contain mb-2"
            />
            <h2 className="font-semibold">{product.title}</h2>
            <p className="text-sm text-gray-600">{product.description}</p>
            {results && (
              <div className="text-xs text-gray-500 mt-2 space-y-1">
                <p>🧠 Testo: {product.textScore?.toFixed(3)}</p>
                <p>🖼️ Immagine: {product.imageScore?.toFixed(3)}</p>
                <p>🎯 Totale: {product.similarity?.toFixed(3)}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}