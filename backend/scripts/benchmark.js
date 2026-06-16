/**
 * ============================================================
 * RELAY BENCHMARK: Atlas Search vs. Regex
 * ============================================================
 * Runs the EXACT same queries using both Atlas Search ($search)
 * and Regex ($regex) against the seeded data, measures latency,
 * and outputs a formatted comparison report.
 *
 * Usage: node backend/scripts/benchmark.js
 *
 * Prerequisites:
 *   1. Run seed.js first: node backend/scripts/seed.js
 *   2. Wait 60s for Atlas Search indexes to sync
 * ============================================================
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

import Note from "../models/Note.js";
import CodeSnippet from "../models/CodeSnippet.js";
import User from "../models/User.js";

// ── Search Queries to Benchmark ────────────────────────────
// Mix of exact-match, partial-match, and multi-word queries
const SEARCH_QUERIES = [
  "binary search",
  "JWT authentication",
  "Redis caching",
  "graph traversal",
  "dynamic programming",
  "MongoDB Atlas",
  "Socket.IO",
  "middleware",
  "DFS recursion",
  "priority queue",
  "rate limiting",
  "merge sort",
  "union find",
  "trie data structure",
  "knapsack",
  "XSS prevention",
  "Dijkstra",
  "topological sort",
  "segment tree",
  "LRU cache",
];

// ── Atlas Search: Exact copy of searchRoutes.js pipeline ───
async function atlasSearchNotes(userId, query) {
  return Note.aggregate([
    {
      $search: {
        index: "default",
        compound: {
          should: [
            { text: { query, path: "title", score: { boost: { value: 3 } } } },
            { text: { query, path: "description" } },
          ],
          minimumShouldMatch: 1,
          filter: [{ equals: { path: "createdBy", value: userId } }],
        },
      },
    },
    { $limit: 5 },
    { $project: { title: 1, description: 1, _id: 1 } },
  ]);
}

async function atlasSearchSnippets(userId, query) {
  return CodeSnippet.aggregate([
    {
      $search: {
        index: "default",
        compound: {
          must: [{ text: { query, path: { wildcard: "*" } } }],
          filter: [{ equals: { path: "user", value: userId } }],
        },
      },
    },
    { $limit: 5 },
    { $project: { title: 1, language: 1, _id: 1 } },
  ]);
}

// ── Regex Search: The fallback path from searchRoutes.js ───
async function regexSearchNotes(userId, query) {
  return Note.find({
    createdBy: userId,
    $or: [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ],
  })
    .sort({ updatedAt: -1 })
    .limit(5)
    .select("title description _id")
    .lean();
}

async function regexSearchSnippets(userId, query) {
  return CodeSnippet.find({
    user: userId,
    $or: [
      { title: { $regex: query, $options: "i" } },
      { code: { $regex: query, $options: "i" } },
      { tags: { $regex: query, $options: "i" } },
    ],
  })
    .sort({ createdAt: -1 })
    .limit(5)
    .select("title language _id")
    .lean();
}

// ── Benchmark Runner ───────────────────────────────────────
async function benchmarkQuery(userId, query) {
  // Warm up (first query is always slower due to cursor setup)
  await regexSearchNotes(userId, "warmup");
  await atlasSearchNotes(userId, "warmup").catch(() => {});

  // Atlas Search timing
  const atlasStart = process.hrtime.bigint();
  let atlasNotes = [], atlasSnippets = [];
  let atlasError = null;
  try {
    [atlasNotes, atlasSnippets] = await Promise.all([
      atlasSearchNotes(userId, query),
      atlasSearchSnippets(userId, query),
    ]);
  } catch (err) {
    atlasError = err.message;
  }
  const atlasEnd = process.hrtime.bigint();
  const atlasMs = Number(atlasEnd - atlasStart) / 1_000_000;

  // Regex timing
  const regexStart = process.hrtime.bigint();
  const [regexNotes, regexSnippets] = await Promise.all([
    regexSearchNotes(userId, query),
    regexSearchSnippets(userId, query),
  ]);
  const regexEnd = process.hrtime.bigint();
  const regexMs = Number(regexEnd - regexStart) / 1_000_000;

  return {
    query,
    atlas: {
      latencyMs: atlasMs.toFixed(2),
      noteResults: atlasError ? "ERROR" : atlasNotes.length,
      snippetResults: atlasError ? "ERROR" : atlasSnippets.length,
      error: atlasError,
    },
    regex: {
      latencyMs: regexMs.toFixed(2),
      noteResults: regexNotes.length,
      snippetResults: regexSnippets.length,
    },
    speedup: atlasError ? "N/A" : `${(regexMs / atlasMs).toFixed(1)}×`,
  };
}

// ── Main ───────────────────────────────────────────────────
async function main() {
  console.log("\n🔌 Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ Connected.\n");

  // Find test user
  const testUser = await User.findOne({ email: "benchmark@relay.dev" });
  if (!testUser) {
    console.error("❌ Test user not found. Run seed.js first: node backend/scripts/seed.js");
    process.exit(1);
  }

  // Count docs
  const noteCount = await Note.countDocuments({ createdBy: testUser._id });
  const snippetCount = await CodeSnippet.countDocuments({ user: testUser._id });
  console.log(`📊 Dataset: ${noteCount} notes + ${snippetCount} snippets = ${noteCount + snippetCount} total documents`);
  console.log(`👤 Test User: ${testUser._id}\n`);

  // Run benchmarks
  console.log("═".repeat(100));
  console.log(
    "  QUERY".padEnd(30) +
    "│ ATLAS SEARCH (ms)".padEnd(22) +
    "│ REGEX (ms)".padEnd(18) +
    "│ SPEEDUP".padEnd(12) +
    "│ ATLAS RESULTS".padEnd(18) +
    "│ REGEX RESULTS"
  );
  console.log("═".repeat(100));

  const results = [];
  let totalAtlas = 0;
  let totalRegex = 0;
  let validCount = 0;

  for (const query of SEARCH_QUERIES) {
    const result = await benchmarkQuery(testUser._id, query);
    results.push(result);

    const atlasLatency = result.atlas.error ? "ERROR" : `${result.atlas.latencyMs}`;
    const atlasResults = result.atlas.error ? "ERR" : `${result.atlas.noteResults}N + ${result.atlas.snippetResults}S`;
    const regexResults = `${result.regex.noteResults}N + ${result.regex.snippetResults}S`;

    console.log(
      `  ${query}`.padEnd(30) +
      `│ ${atlasLatency}`.padEnd(22) +
      `│ ${result.regex.latencyMs}`.padEnd(18) +
      `│ ${result.speedup}`.padEnd(12) +
      `│ ${atlasResults}`.padEnd(18) +
      `│ ${regexResults}`
    );

    if (!result.atlas.error) {
      totalAtlas += parseFloat(result.atlas.latencyMs);
      totalRegex += parseFloat(result.regex.latencyMs);
      validCount++;
    }
  }

  console.log("═".repeat(100));

  // Summary stats
  if (validCount > 0) {
    const avgAtlas = (totalAtlas / validCount).toFixed(2);
    const avgRegex = (totalRegex / validCount).toFixed(2);
    const avgSpeedup = (totalRegex / totalAtlas).toFixed(1);

    const minAtlas = Math.min(...results.filter(r => !r.atlas.error).map(r => parseFloat(r.atlas.latencyMs))).toFixed(2);
    const maxAtlas = Math.max(...results.filter(r => !r.atlas.error).map(r => parseFloat(r.atlas.latencyMs))).toFixed(2);
    const minRegex = Math.min(...results.map(r => parseFloat(r.regex.latencyMs))).toFixed(2);
    const maxRegex = Math.max(...results.map(r => parseFloat(r.regex.latencyMs))).toFixed(2);

    // Per-result efficiency
    let totalAtlasResults = 0, totalRegexResults = 0;
    let atlasQueriesWithResults = 0, regexQueriesWithResults = 0;
    results.forEach(r => {
      if (!r.atlas.error) {
        const ar = r.atlas.noteResults + r.atlas.snippetResults;
        totalAtlasResults += ar;
        if (ar > 0) atlasQueriesWithResults++;
      }
      const rr = r.regex.noteResults + r.regex.snippetResults;
      totalRegexResults += rr;
      if (rr > 0) regexQueriesWithResults++;
    });

    const atlasPerResult = totalAtlasResults > 0 ? (totalAtlas / totalAtlasResults).toFixed(2) : "∞";
    const regexPerResult = totalRegexResults > 0 ? (totalRegex / totalRegexResults).toFixed(2) : "∞";
    const recallImprovement = totalRegexResults > 0 ? ((totalAtlasResults / totalRegexResults) * 100 - 100).toFixed(0) : "∞";

    console.log("\n📈 SUMMARY");
    console.log("─".repeat(60));
    console.log(`  Dataset Size:         ${noteCount + snippetCount} documents`);
    console.log(`  Queries Tested:       ${validCount}`);
    console.log(`  `);
    console.log(`  ── LATENCY ──`);
    console.log(`  Atlas Search (avg):   ${avgAtlas} ms  (min: ${minAtlas}, max: ${maxAtlas})`);
    console.log(`  Regex Search (avg):   ${avgRegex} ms  (min: ${minRegex}, max: ${maxRegex})`);
    console.log(`  ⚡ Latency Speedup:   ${avgSpeedup}×`);
    console.log(`  `);
    console.log(`  ── RECALL (Search Quality) ──`);
    console.log(`  Atlas total results:  ${totalAtlasResults} across ${atlasQueriesWithResults}/${validCount} queries`);
    console.log(`  Regex total results:  ${totalRegexResults} across ${regexQueriesWithResults}/${validCount} queries`);
    console.log(`  📊 Recall improvement: +${recallImprovement}% more results with Atlas`);
    console.log(`  `);
    console.log(`  ── EFFICIENCY (ms per useful result) ──`);
    console.log(`  Atlas Search:         ${atlasPerResult} ms/result`);
    console.log(`  Regex Search:         ${regexPerResult} ms/result`);
    if (totalRegexResults > 0 && totalAtlasResults > 0) {
      const efficiencySpeedup = (parseFloat(regexPerResult) / parseFloat(atlasPerResult)).toFixed(1);
      console.log(`  ⚡ Efficiency Speedup: ${efficiencySpeedup}× (Atlas finds more per ms spent)`);
    }
    console.log(`  `);
    console.log(`  ✅ Resume-ready claims:`);
    console.log(`     LATENCY: "Atlas Search avg ${avgAtlas}ms vs Regex avg ${avgRegex}ms on ${noteCount + snippetCount}+ docs"`);
    console.log(`     RECALL:  "${totalAtlasResults} vs ${totalRegexResults} total results (+${recallImprovement}% recall improvement)"`);
    console.log(`     EFFICIENCY: "${atlasPerResult} ms/result vs ${regexPerResult} ms/result"`);
    console.log("─".repeat(60));
  } else {
    console.log("\n⚠️  No Atlas Search results. Possible reasons:");
    console.log("   1. Atlas Search index 'default' doesn't exist on this cluster");
    console.log("   2. Index hasn't synced yet (wait 60s after seeding)");
    console.log("   3. Free-tier M0 cluster (Atlas Search requires M0 with search enabled)");
    console.log("\n   Regex-only results are still valid for baseline measurement.");
  }

  await mongoose.disconnect();
  console.log("\n✅ Benchmark complete.\n");
}

main().catch((err) => {
  console.error("❌ Benchmark failed:", err);
  process.exit(1);
});
