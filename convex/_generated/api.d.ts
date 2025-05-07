/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as products from "../products.js";
import type * as search from "../search.js";
import type * as seed from "../seed.js";
import type * as utils_cosineSimilarity from "../utils/cosineSimilarity.js";
import type * as utils_pollReplicatePrediction from "../utils/pollReplicatePrediction.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  products: typeof products;
  search: typeof search;
  seed: typeof seed;
  "utils/cosineSimilarity": typeof utils_cosineSimilarity;
  "utils/pollReplicatePrediction": typeof utils_pollReplicatePrediction;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
