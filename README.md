# QuantumWave Edge v1.3 (QWE v1.3) - Elite Sniper Bot 🔫⚡

Welcome to **QuantumWave Edge v1.3**, an elite binary options sniper bot engineered for high-precision scalping on the **Volatility 25 Index (R_25)** using Deriv's WebSocket API.

> "One shot. One kill. No luck, just strategy."

---

## 🚀 Features

- 📡 **WebSocket API Integration**
- 📈 **EMA + RSI + ATR** market filters
- 🧠 **Trend Confirmation Sniper Logic**
- 🛑 **Smart Kill Switch** after failed recovery
- ♻️ **Recovery Mode (2.25x Stake Multiplier)**
- 🔥 **Adaptive Volatility Scanner**
- 📊 **Live Dashboard (index.html)** for monitoring

---

## 🧠 Strategy Summary

- Uses **EMA(9 & 20)** for short-term trend filtering  
- Confirms trades with **RSI(14)** for momentum strength  
- Checks **ATR(14)** for sufficient volatility before execution  
- Trades are only executed during confirmed uptrends (CALL) or downtrends (PUT)

---

## 📁 Files

| File        | Description                                |
|-------------|--------------------------------------------|
| `bot.js`    | Core logic for QWE v1.3 Sniper Bot         |
| `index.html`| Live dashboard for real-time monitoring    |

---

## 🛠️ Setup Instructions

1. Clone the repo or download the files.
2. Open `index.html` in your browser for the dashboard.
3. Replace the API token in `bot.js` with your own:
   ```js
   const apiToken = "YOUR_API_TOKEN_HERE";
⚠️ Disclaimer
This bot is for educational purposes.
Trade responsibly. Past performance is not indicative of future results.

👑 Authors
👨‍💻 NeoStratX (Strategy & Execution)

🤖 Gee (Code Architect & Guidance AI)

