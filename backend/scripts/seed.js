/**
 * ============================================================
 * RELAY BENCHMARK SEEDER
 * ============================================================
 * Creates 1200+ realistic notes and code snippets in MongoDB
 * for benchmarking Atlas Search vs. Regex performance.
 *
 * Usage: node backend/scripts/seed.js
 * Cleanup: node backend/scripts/seed.js --cleanup
 * ============================================================
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from backend/.env
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import Note from "../models/Note.js";
import CodeSnippet from "../models/CodeSnippet.js";
import User from "../models/User.js";

// ── Realistic Data Templates ──────────────────────────────

const NOTE_TOPICS = [
  { title: "JWT Authentication Architecture", desc: "Implementing stateless authentication using JSON Web Tokens. The flow involves generating tokens on login with HS256 signing, storing them client-side in localStorage, and verifying on each protected route via middleware. Token expiry is set to 30 days. Refresh token rotation was considered but deferred for v2." },
  { title: "Redis Caching Strategy", desc: "Using Upstash Redis for caching contest data and implementing rate limiting. Cache TTL is set to 3600 seconds (1 hour). The caching layer uses lazy initialization and graceful degradation — if Redis is unavailable, the app continues without caching. Rate limiting uses sorted set sliding windows." },
  { title: "MongoDB Atlas Search Integration", desc: "Replaced regex-based search with MongoDB Atlas Search using Lucene inverted indexes. The search aggregation pipeline uses $search with compound queries, supporting fuzzy matching and relevance scoring. Title matches receive a 3x boost over description matches. Fallback to regex if Atlas returns zero results." },
  { title: "Socket.IO Room Architecture", desc: "Real-time collaboration uses Socket.IO rooms with an in-memory Map for tracking active users per room. Each user gets a randomly assigned color from a 6-color palette. The architecture handles join, leave, typing indicators, code sync, and language sync events. Activity logs are persisted to MongoDB with a 24-hour TTL index." },
  { title: "React Component Lifecycle Optimization", desc: "Profiling the Dashboard component revealed unnecessary re-renders when switching tabs. Implemented React.memo on NavItem components and useCallback on the command action handler. The CommandPalette uses useMemo for filtered results to avoid recalculation on every keystroke." },
  { title: "Express Middleware Chain Design", desc: "The middleware execution order is: CORS → JSON parser → Rate Limiter (for AI/compiler routes) → JWT Auth → Route Handler. The rate limiter middleware uses a factory pattern accepting maxRequests, windowMs, and prefix parameters. Auth middleware extracts the Bearer token, verifies via jwt.verify, and attaches the user to req." },
  { title: "TipTap Rich Text Editor Configuration", desc: "Using TipTap v3 with StarterKit, Image extension, Link extension, and Placeholder extension. The editor outputs HTML which is sanitized server-side using DOMPurify before MongoDB persistence. Allowed tags include p, h1-h6, ul, ol, li, strong, em, code, pre, a, img, blockquote." },
  { title: "Cloudinary Image Upload Pipeline", desc: "Profile images are uploaded via multer to os.tmpdir() with a 5MB file size limit, then transferred to Cloudinary's devdocs folder. After successful upload, the temp file is cleaned up using fs.unlink. The secure_url is returned to the client and stored in the UserProfile model." },
  { title: "Docker Compose Configuration", desc: "The docker-compose.yml defines two services: backend (port 4000:3000) and frontend (port 5000:5173). Both services read from the root .env file. The backend depends_on the frontend service. For production, the build command runs npm install in both directories and builds the frontend." },
  { title: "Password Reset Flow with Brevo SMTP", desc: "Forgot password generates a crypto.randomBytes(32) token, hashes it with SHA-256, and stores the hash in the User model with a 15-minute expiry. The raw token is sent via Brevo SMTP API. On reset, the incoming token is hashed again and compared against the stored hash — even if the database is compromised, raw tokens cannot be derived." },
  { title: "API Rate Limiting with Redis Sorted Sets", desc: "Instead of using a fixed-window counter, the rate limiter uses Redis sorted sets for true sliding-window limiting. Each request adds a timestamped entry; expired entries are pruned on each check. This prevents the boundary-burst problem where users can double their quota at the window edge." },
  { title: "MongoDB Schema Design Decisions", desc: "The UserProfile model uses nested sub-schemas for projects and resumes with _id: false to prevent unnecessary ObjectId generation. The CodeSnippet model has a critical language_override: 'dummy' on its text index to prevent MongoDB from interpreting programming language names as natural language hints." },
  { title: "Compiler API Failover Strategy", desc: "Code execution uses a two-provider cascade: OnlineCompiler.io (primary) → Piston API (fallback). Since Piston went whitelist-only in Feb 2026, OnlineCompiler.io handles most requests. Both providers return normalized {run: {stdout, stderr}} responses. 30-second timeout on both." },
  { title: "Gemini AI Model Cascade", desc: "AI features use gemini-2.5-flash as primary and gemini-2.0-flash as backup. The cascade ensures ~99% availability during Google API quota events. Rate limited to 10 requests per minute per user via the Redis sliding-window limiter." },
  { title: "XSS Prevention in Rich Text Storage", desc: "Notes store raw HTML from the TipTap editor. Before saving to MongoDB, the description field is sanitized using DOMPurify (server-side via jsdom). The sanitizer strips script tags, event handlers (onclick, onerror), javascript: URIs, and iframes, while preserving formatting tags like strong, em, code, and img." },
  { title: "Framer Motion Animation Patterns", desc: "Tab transitions use AnimatePresence with mode='wait' for sequential exit/enter animations. Initial state: opacity 0, y 15. Animate: opacity 1, y 0. Exit: opacity 0, y -15. Duration: 200ms. The sidebar active indicator uses layoutId for shared layout animations." },
  { title: "Contest Aggregation Architecture", desc: "Upcoming contests are fetched from CLIST API v4, aggregating 9 platforms: Codeforces, LeetCode, CodeChef, AtCoder, HackerRank, HackerEarth, TopCoder, GeeksforGeeks, Naukri Code360. Results are cached in Redis for 1 hour. On API failure, stale cache is served with a warning header." },
  { title: "Public Profile URL Architecture", desc: "User profiles are accessible at /u/:username without authentication. The backend resolves the username to a User document, then fetches the associated UserProfile. The profile includes GitHub stats, LeetCode stats, skills with icons from SkillIcons.dev, and project cards with OpenGraph preview images." },
  { title: "Monaco Editor Integration", desc: "The code editor in RelaySandBox uses @monaco-editor/react with vs-dark theme. Language support includes JavaScript, TypeScript, Python, Java, C++, Go, and Rust. Code changes are debounced before Socket.IO emission. The editor wrapper is isolated in devspace/CodeEditor.jsx for clean separation." },
  { title: "Command Palette Design (Ctrl+K)", desc: "The command palette supports 12 actions across 3 categories: Navigate (7), Create (3), and System (2). It uses fuzzy filtering based on label, keywords, and category. Keyboard navigation supports arrow keys + Enter for selection. Built with Framer Motion for smooth enter/exit animations." },
];

const SNIPPET_TEMPLATES = [
  { title: "Binary Search Template", code: `function binarySearch(arr, target) {\n  let lo = 0, hi = arr.length - 1;\n  while (lo <= hi) {\n    const mid = Math.floor((lo + hi) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) lo = mid + 1;\n    else hi = mid - 1;\n  }\n  return -1;\n}`, language: "javascript", tags: ["algorithm", "search", "binary-search"] },
  { title: "BFS Graph Traversal", code: `def bfs(graph, start):\n    visited = set()\n    queue = [start]\n    visited.add(start)\n    while queue:\n        node = queue.pop(0)\n        for neighbor in graph[node]:\n            if neighbor not in visited:\n                visited.add(neighbor)\n                queue.append(neighbor)\n    return visited`, language: "python", tags: ["graph", "bfs", "traversal"] },
  { title: "DFS Recursive Implementation", code: `void dfs(vector<vector<int>>& graph, int node, vector<bool>& visited) {\n    visited[node] = true;\n    for (int neighbor : graph[node]) {\n        if (!visited[neighbor]) {\n            dfs(graph, neighbor, visited);\n        }\n    }\n}`, language: "cpp", tags: ["graph", "dfs", "recursion"] },
  { title: "Merge Sort Algorithm", code: `function mergeSort(arr) {\n  if (arr.length <= 1) return arr;\n  const mid = Math.floor(arr.length / 2);\n  const left = mergeSort(arr.slice(0, mid));\n  const right = mergeSort(arr.slice(mid));\n  return merge(left, right);\n}\n\nfunction merge(a, b) {\n  const result = [];\n  let i = 0, j = 0;\n  while (i < a.length && j < b.length) {\n    result.push(a[i] <= b[j] ? a[i++] : b[j++]);\n  }\n  return result.concat(a.slice(i)).concat(b.slice(j));\n}`, language: "javascript", tags: ["sorting", "divide-and-conquer", "merge-sort"] },
  { title: "Dijkstra Shortest Path", code: `import heapq\n\ndef dijkstra(graph, start):\n    dist = {node: float('inf') for node in graph}\n    dist[start] = 0\n    pq = [(0, start)]\n    while pq:\n        d, u = heapq.heappop(pq)\n        if d > dist[u]: continue\n        for v, w in graph[u]:\n            if dist[u] + w < dist[v]:\n                dist[v] = dist[u] + w\n                heapq.heappush(pq, (dist[v], v))\n    return dist`, language: "python", tags: ["graph", "shortest-path", "dijkstra", "priority-queue"] },
  { title: "Union-Find with Path Compression", code: `class UnionFind {\n  constructor(n) {\n    this.parent = Array.from({length: n}, (_, i) => i);\n    this.rank = new Array(n).fill(0);\n  }\n  find(x) {\n    if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x]);\n    return this.parent[x];\n  }\n  union(x, y) {\n    const px = this.find(x), py = this.find(y);\n    if (px === py) return false;\n    if (this.rank[px] < this.rank[py]) this.parent[px] = py;\n    else if (this.rank[px] > this.rank[py]) this.parent[py] = px;\n    else { this.parent[py] = px; this.rank[px]++; }\n    return true;\n  }\n}`, language: "javascript", tags: ["dsu", "union-find", "graph"] },
  { title: "Dynamic Programming - Knapsack", code: `int knapsack(vector<int>& wt, vector<int>& val, int W) {\n    int n = wt.size();\n    vector<vector<int>> dp(n+1, vector<int>(W+1, 0));\n    for (int i = 1; i <= n; i++) {\n        for (int w = 0; w <= W; w++) {\n            dp[i][w] = dp[i-1][w];\n            if (wt[i-1] <= w)\n                dp[i][w] = max(dp[i][w], dp[i-1][w-wt[i-1]] + val[i-1]);\n        }\n    }\n    return dp[n][W];\n}`, language: "cpp", tags: ["dp", "knapsack", "dynamic-programming"] },
  { title: "Trie Data Structure", code: `class TrieNode:\n    def __init__(self):\n        self.children = {}\n        self.is_end = False\n\nclass Trie:\n    def __init__(self):\n        self.root = TrieNode()\n    \n    def insert(self, word):\n        node = self.root\n        for c in word:\n            if c not in node.children:\n                node.children[c] = TrieNode()\n            node = node.children[c]\n        node.is_end = True\n    \n    def search(self, word):\n        node = self.root\n        for c in word:\n            if c not in node.children: return False\n            node = node.children[c]\n        return node.is_end`, language: "python", tags: ["trie", "string", "data-structure"] },
  { title: "Segment Tree Range Query", code: `class SegTree {\n  int n; vector<int> tree;\npublic:\n  SegTree(vector<int>& a) : n(a.size()), tree(4*n) { build(a,1,0,n-1); }\n  void build(vector<int>& a,int v,int l,int r) {\n    if(l==r) { tree[v]=a[l]; return; }\n    int m=(l+r)/2;\n    build(a,2*v,l,m); build(a,2*v+1,m+1,r);\n    tree[v]=tree[2*v]+tree[2*v+1];\n  }\n  int query(int v,int l,int r,int ql,int qr) {\n    if(ql>r||qr<l) return 0;\n    if(ql<=l&&r<=qr) return tree[v];\n    int m=(l+r)/2;\n    return query(2*v,l,m,ql,qr)+query(2*v+1,m+1,r,ql,qr);\n  }\n};`, language: "cpp", tags: ["segment-tree", "range-query", "data-structure"] },
  { title: "LRU Cache Implementation", code: `class LRUCache {\n  constructor(capacity) {\n    this.capacity = capacity;\n    this.cache = new Map();\n  }\n  get(key) {\n    if (!this.cache.has(key)) return -1;\n    const val = this.cache.get(key);\n    this.cache.delete(key);\n    this.cache.set(key, val);\n    return val;\n  }\n  put(key, value) {\n    this.cache.delete(key);\n    this.cache.set(key, value);\n    if (this.cache.size > this.capacity)\n      this.cache.delete(this.cache.keys().next().value);\n  }\n}`, language: "javascript", tags: ["design", "lru", "cache", "linked-list"] },
  { title: "Topological Sort (Kahn's)", code: `def topological_sort(graph, n):\n    indeg = [0]*n\n    for u in range(n):\n        for v in graph[u]: indeg[v] += 1\n    q = [u for u in range(n) if indeg[u]==0]\n    order = []\n    while q:\n        u = q.pop(0)\n        order.append(u)\n        for v in graph[u]:\n            indeg[v] -= 1\n            if indeg[v]==0: q.append(v)\n    return order if len(order)==n else []`, language: "python", tags: ["graph", "topological-sort", "dag"] },
  { title: "KMP Pattern Matching", code: `vector<int> kmpSearch(string& text, string& pat) {\n    int n=text.size(), m=pat.size();\n    vector<int> lps(m,0), res;\n    for(int i=1,len=0;i<m;) {\n        if(pat[i]==pat[len]) lps[i++]=++len;\n        else if(len) len=lps[len-1];\n        else lps[i++]=0;\n    }\n    for(int i=0,j=0;i<n;) {\n        if(text[i]==pat[j]) { i++; j++; }\n        if(j==m) { res.push_back(i-j); j=lps[j-1]; }\n        else if(i<n&&text[i]!=pat[j]) {\n            if(j) j=lps[j-1]; else i++;\n        }\n    }\n    return res;\n}`, language: "cpp", tags: ["string", "kmp", "pattern-matching"] },
  { title: "Express JWT Middleware", code: `import jwt from 'jsonwebtoken';\nimport User from '../models/User.js';\n\nexport const protect = async (req, res, next) => {\n  let token;\n  if (req.headers.authorization?.startsWith('Bearer')) {\n    try {\n      token = req.headers.authorization.split(' ')[1];\n      const decoded = jwt.verify(token, process.env.JWT_SECRET);\n      req.user = await User.findById(decoded.id).select('-password');\n      return next();\n    } catch (e) {\n      return res.status(401).json({ message: 'Token failed' });\n    }\n  }\n  return res.status(401).json({ message: 'No token' });\n};`, language: "javascript", tags: ["auth", "jwt", "middleware", "express"] },
  { title: "React Custom Hook - useDebounce", code: `import { useState, useEffect } from 'react';\n\nexport function useDebounce(value, delay = 300) {\n  const [debounced, setDebounced] = useState(value);\n  useEffect(() => {\n    const timer = setTimeout(() => setDebounced(value), delay);\n    return () => clearTimeout(timer);\n  }, [value, delay]);\n  return debounced;\n}`, language: "javascript", tags: ["react", "hook", "debounce", "performance"] },
  { title: "Fenwick Tree (BIT)", code: `class BIT:\n    def __init__(self, n):\n        self.n = n\n        self.tree = [0]*(n+1)\n    def update(self, i, delta):\n        while i <= self.n:\n            self.tree[i] += delta\n            i += i & (-i)\n    def query(self, i):\n        s = 0\n        while i > 0:\n            s += self.tree[i]\n            i -= i & (-i)\n        return s\n    def range_query(self, l, r):\n        return self.query(r) - self.query(l-1)`, language: "python", tags: ["bit", "fenwick", "data-structure", "range-query"] },
];

// Generate variations to hit 1200+ docs
function generateVariations(templates, count, type) {
  const results = [];
  const adjectives = ["Optimized", "Advanced", "Clean", "Refactored", "Production", "Enterprise", "Scalable", "Efficient", "Modern", "Minimal"];
  const contexts = ["for microservices", "for REST APIs", "in distributed systems", "for real-time apps", "for competitive programming", "for web applications", "for backend services", "for frontend components", "for mobile apps", "for serverless functions"];

  for (let i = 0; i < count; i++) {
    const template = templates[i % templates.length];
    const adj = adjectives[i % adjectives.length];
    const ctx = contexts[Math.floor(i / templates.length) % contexts.length];
    const variant = i >= templates.length ? ` — Variant ${Math.floor(i / templates.length) + 1}` : "";

    if (type === "note") {
      results.push({
        title: `${adj} ${template.title}${variant}`,
        description: `${template.desc} Context: ${ctx}. Iteration ${i + 1} with additional optimization considerations and edge case handling.`,
        isPinned: i % 7 === 0,
      });
    } else {
      results.push({
        title: `${adj} ${template.title}${variant}`,
        code: template.code,
        language: template.language,
        tags: [...template.tags, adj.toLowerCase(), `v${Math.floor(i / templates.length) + 1}`],
        timeComplexity: ["O(n)", "O(n log n)", "O(log n)", "O(n²)", "O(V+E)"][i % 5],
        spaceComplexity: ["O(1)", "O(n)", "O(log n)", "O(n²)", "O(V)"][i % 5],
        isFavorite: i % 10 === 0,
      });
    }
  }
  return results;
}

// ── Main ──────────────────────────────────────────────────

async function main() {
  const isCleanup = process.argv.includes("--cleanup");

  console.log("\n🔌 Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ Connected.\n");

  // Find or create a test user
  let testUser = await User.findOne({ email: "benchmark@relay.dev" });
  if (!testUser && !isCleanup) {
    testUser = await User.create({
      username: "benchmark_bot",
      email: "benchmark@relay.dev",
      password: "BenchmarkTest123!",
    });
    console.log(`📌 Created test user: ${testUser._id}`);
  }

  if (isCleanup) {
    console.log("🧹 Cleaning up benchmark data...");
    const user = await User.findOne({ email: "benchmark@relay.dev" });
    if (user) {
      const notesDel = await Note.deleteMany({ createdBy: user._id });
      const snippetsDel = await CodeSnippet.deleteMany({ user: user._id });
      await User.deleteOne({ email: "benchmark@relay.dev" });
      console.log(`   Deleted ${notesDel.deletedCount} notes, ${snippetsDel.deletedCount} snippets, 1 user.`);
    }
    console.log("✅ Cleanup complete.\n");
    await mongoose.disconnect();
    process.exit(0);
  }

  // Generate 5000 notes + 5000 snippets = 10000 total docs
  const NOTE_COUNT = 5000;
  const SNIPPET_COUNT = 5000;

  console.log(`📝 Generating ${NOTE_COUNT} notes...`);
  const notes = generateVariations(NOTE_TOPICS, NOTE_COUNT, "note").map((n) => ({
    ...n,
    createdBy: testUser._id,
  }));

  console.log(`💾 Generating ${SNIPPET_COUNT} snippets...`);
  const snippets = generateVariations(SNIPPET_TEMPLATES, SNIPPET_COUNT, "snippet").map((s) => ({
    ...s,
    user: testUser._id,
  }));

  // Batch insert
  console.log("\n⏳ Inserting notes...");
  const noteResult = await Note.insertMany(notes);
  console.log(`   ✅ Inserted ${noteResult.length} notes.`);

  console.log("⏳ Inserting snippets...");
  const snippetResult = await CodeSnippet.insertMany(snippets);
  console.log(`   ✅ Inserted ${snippetResult.length} snippets.`);

  console.log(`\n🎯 TOTAL: ${noteResult.length + snippetResult.length} documents seeded.`);
  console.log(`👤 Test User ID: ${testUser._id}`);
  console.log(`\n⚠️  Wait 30-60 seconds for Atlas Search indexes to sync before running benchmarks.`);
  console.log(`💡 To cleanup: node backend/scripts/seed.js --cleanup\n`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
