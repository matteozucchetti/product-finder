# AI Product Finder

**AI Product Finder** is a demo web application that allows users to search for products in a database using natural language prompts. The search leverages the CLIP model to compare the vector representation of a user's text prompt with the vector embeddings of product images, surfacing the most relevant products based on semantic similarity.

## Main Goal

The primary goal of this app is to provide an intuitive tool for searching products by meaning, not just keywords. By using AI-powered vector search, users can describe what they're looking for in their own words, and the app will find products whose images are most semantically similar to the prompt (hopefully).

---

## Features

- **AI-powered search:** Uses OpenAI's CLIP model (via Replicate) to embed both product images and user text prompts into a shared vector space.
- **Semantic matching:** Products are ranked by cosine similarity between the prompt embedding and each product's image embedding.
- **Sample product database:** Products are seeded from [Fake Store API](https://fakestoreapi.com/) and stored with their image embeddings.
- **Modern UI:** Built with React, Tailwind CSS, and Shadcn UI components.
- **Backend:** Uses Convex Backend as a Service for backend logic and database.

---

## Technologies Used

- **React** (with TypeScript) for the frontend UI
- **Vite** for fast development and build tooling
- **Tailwind CSS** for styling
- **Convex** for backend/database and serverless functions
- **OpenAI CLIP model** (via Replicate API) for generating vector embeddings
- **Fake Store API** for initial product data

---

## How It Works

1. **Seeding Products:**
   On setup, products are fetched from the Fake Store API. Each product image is sent to the CLIP model (hosted on Replicate) to generate an image embedding, which is stored in the database.

2. **Searching:**
   When a user enters a text prompt, the prompt is sent to the CLIP model to generate a text embedding. The app then compares this embedding to all product image embeddings using cosine similarity, returning the top matches.

3. **User Experience:**
   - Users see a list of all the available sample products on load.
   - Enter a descriptive prompt (e.g., "women's red t-shirt") and click "Search".
   - The most relevant products are displayed, ranked by similarity score.

---

## Getting Started

### Prerequisites

- **Node.js** (v18+ recommended)
- **pnpm** (or npm/yarn)
- **Convex CLI** (`npm install -g convex`)
- **Replicate API Token** (for CLIP model access)

### Installation

1. **Clone the repository:**

   ```sh
   git clone <repo-url>
   cd product-finder
   ```

2. **Install dependencies:**

   ```sh
   pnpm install
   # or
   npm install
   ```

3. **Initialize Convex:**

   ```sh
   npx convex dev
   ```

   (Follow prompts to set up your Convex project if needed.)

4. **Set up environment variables:**

   - Set the `REPLICATE_API_TOKEN` environment variable in your Convex dashboard (not in the client `.env` file), as it is required by the backend to access the Replicate API.
   - You can do this by running:
     ```sh
     npx convex env set REPLICATE_API_TOKEN your_replicate_api_token_here
     ```
   - Or by setting it directly in the Convex dashboard UI.

5. **Seed the product database:**

   - Run the seeding action via Convex dashboard or CLI to fetch and embed products.

6. **Start the development server:**

   ```sh
   pnpm dev
   # or
   npm run dev
   ```

   This will concurrently start both the Vite frontend and Convex backend.

7. **Open the app:**
   - Visit [http://localhost:5173](http://localhost:5173) in your browser.

---

## Scripts

- `pnpm dev` — Start frontend and backend in development mode
- `pnpm build` — Build the frontend for production

---

## Notes

- The app uses the Replicate API for CLIP embeddings, which may incur costs or rate limits.
- Product seeding is a one-time operation but can be repeated if needed.
- The app is for demo purposes and not production-hardened.
