// index.js
// Crypto Tracker using CoinGecko API

import express from "express";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const API_BASE = "https://api.coingecko.com/api/v3";

// Express config
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

// Homepage - Top 10 cryptocurrencies
app.get("/", async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE}/coins/markets`, {
      params: {
        vs_currency: "usd",
        order: "market_cap_desc",
        per_page: 10,
        page: 1,
        sparkline: false,
      },
    });
    const coins = response.data;
    res.render("index", { coins, error: null });
  } catch (err) {
    console.error(err.message);
    res.render("index", { coins: [], error: "Failed to load market data." });
  }
});

// Search route
app.get("/search", async (req, res) => {
  const query = (req.query.q || "").trim().toLowerCase();
  if (!query) return res.render("search", { coin: null, error: "Please enter a coin name." });

  try {
    // Search API
    const searchResp = await axios.get(`${API_BASE}/search`, { params: { query } });
    const matched = searchResp.data.coins[0];

    if (!matched) return res.render("search", { coin: null, error: "No coin found with that name." });

    // Fetch detailed info by ID
    const detailResp = await axios.get(`${API_BASE}/coins/${matched.id}`);
    const coin = detailResp.data;
    res.render("search", { coin, error: null });
  } catch (err) {
    console.error(err.message);
    res.render("search", { coin: null, error: "Search failed. Try again later." });
  }
});

// Detailed coin info by ID
app.get("/coin/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const response = await axios.get(`${API_BASE}/coins/${id}`);
    const coin = response.data;
    res.render("coin", { coin, error: null });
  } catch (err) {
    console.error(err.message);
    res.render("coin", { coin: null, error: "Failed to fetch coin details." });
  }
});

// 404 fallback
app.use((req, res) => res.status(404).send("404 Not Found"));

app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));