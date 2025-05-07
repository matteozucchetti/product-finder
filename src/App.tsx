import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { Card, CardTitle, CardContent } from "./components/ui/card";

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [results, setResults] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const searchProducts = useAction(api.search.searchProducts);
  const allProducts = useQuery(api.products.getAllProducts) ?? [];

  async function handleSearch() {
    if (prompt) {
      setIsLoading(true);
      const res = await searchProducts({ prompt });
      setResults(res);
      setIsLoading(false);
    } else {
      setResults(null);
    }
  }

  function handleClear() {
    setPrompt("");
    setResults(null);
  }

  return (
    <div className="p-4 mx-auto flex flex-col gap-4">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">Product finder</h1>

      <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0">
        Search for products by image with AI
      </h2>

      <p className="text-sm text-muted-foreground">
        How it works:
      </p>
      <ul className="ml-6 list-disc [&>li]:mt-2 text-sm text-muted-foreground">
        <li>Below you can find a list of some sample products.</li>
        <li>You can search for products by writing a prompt describing the product you are looking for.</li>
        <li>AI will convert your prompt into a search query and return a list of products that match your search with a score.</li>
      </ul>

      <div className="flex gap-2 mb-4">
        <Input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Red T-shirt for women"
          className="flex-1"
        />
        <Button
          onClick={handleSearch}
          disabled={isLoading}
        >
          {isLoading ? "Searching..." : "Search"}
        </Button>
        {results && (
          <Button
            onClick={handleClear}
            variant="destructive"
          >
            Clear
          </Button>
        )}
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {(results ?? allProducts).map((product) => (
          <Card key={product._id} className="p-0">
            <CardContent className="p-4 flex flex-col items-center">
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-full h-40 object-contain mb-4"
              />
              <CardTitle className="font-semibold w-full">{product.title}</CardTitle>
              {results && (
                <div className="text-xs text-gray-500 mt-2 space-y-1">
                  <p>🎯 Score: {product.similarity?.toFixed(3)}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}