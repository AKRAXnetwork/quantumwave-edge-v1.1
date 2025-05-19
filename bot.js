// QuantumWave Edge v1.3 - Final Deployable Bot for V25
// Author: NeoStratX x Gee (ChatGPT)
// Features: MA, RSI, ATR, Recovery Logic, Kill Switch, Performance Log

const apiToken = "***********9jv7"; 
const ws = new WebSocket("wss://ws.binaryws.com/websockets/v3?app_id=1089");

let authorized = false;
let isTradeInProgress = false;
let tradeCount = 0;
let winCount = 0;
let lossCount = 0;
let stake = 1;
const baseStake = 1;
const recoveryMultiplier = 2.25;
let recoveryMode = false;
let cooldownCycles = 0;
let ticks = [];
let killSwitchLossLimit = 5;

ws.onopen = () => {
    console.log("🔌 Connected to Deriv WebSocket");
    ws.send(JSON.stringify({ authorize: apiToken }));
};

ws.onmessage = (msg) => {
    const data = JSON.parse(msg.data);

    if (data.msg_type === "authorize") {
        authorized = true;
        console.log("✅ Authorized");
        subscribeToTicks();
    }

    if (data.msg_type === "tick") {
        ticks.push(parseFloat(data.tick.quote));
        if (ticks.length > 30) ticks.shift();

        if (!isTradeInProgress && cooldownCycles === 0 && lossCount < killSwitchLossLimit) {
            if (checkVolatility()) {
                const signal = sniperLogic();
                if (signal) executeTrade(signal);
            } else {
                console.log("📉 Low Volatility - No Trade");
            }
        } else if (cooldownCycles > 0) {
            cooldownCycles--;
            console.log(`🕒 Cooldown: ${cooldownCycles}`);
        }
    }

    if (data.msg_type === "proposal_open_contract") {
        if (data.proposal_open_contract.is_sold) {
            isTradeInProgress = false;
            const profit = parseFloat(data.proposal_open_contract.profit);
            const result = profit > 0 ? "WIN" : "LOSS";

            tradeCount++;
            profitTotal += profit;

            if (result === "WIN") {
                winCount++;
                stake = baseStake;
                recoveryMode = false;
                console.log(`✅ WIN | +$${profit.toFixed(2)}`);
            } else {
                lossCount++;
                console.log(`🛑 LOSS | -$${Math.abs(profit).toFixed(2)}`);
                if (!recoveryMode) {
                    stake *= recoveryMultiplier;
                    recoveryMode = true;
                } else {
                    console.log("🔥 Double Loss: Cooldown Activated");
                    cooldownCycles = 3;
                    stake = baseStake;
                    recoveryMode = false;
                }
            }

            if (lossCount >= killSwitchLossLimit) {
                console.log("🚫 Kill Switch Triggered: Max Losses Hit. Stopping.");
            }

            logPerformance();
        }
    }

    if (data.error) {
        console.error("❌ ERROR:", data.error.message);
        isTradeInProgress = false;
    }
};

// 📡 Subscribe to V25 Ticks
function subscribeToTicks() {
    ws.send(JSON.stringify({ ticks: "R_25", subscribe: 1 }));
}

// 📏 Volatility Check (ATR + stdDev)
function checkVolatility() {
    if (ticks.length < 20) return false;
    const changes = ticks.slice(1).map((t, i) => Math.abs(t - ticks[i]));
    const atr = changes.reduce((a, b) => a + b, 0) / changes.length;
    const avg = changes.reduce((a, b) => a + b, 0) / changes.length;
    const stdDev = Math.sqrt(changes.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / changes.length);
    return atr > 0.1 && stdDev > 0.15;
}

// 🔍 Sniper Entry Logic (MA + RSI + Momentum)
function sniperLogic() {
    if (ticks.length < 14) return false;
    const sma5 = simpleMA(ticks.slice(-5));
    const sma10 = simpleMA(ticks.slice(-10));
    const rsi = calculateRSI(ticks);
    const recent = ticks.slice(-5);
    const [c1, c2, c3, c4, c5] = recent;
    const momentum = Math.abs(c5 - c1);
    const noise = Math.max(...recent) - Math.min(...recent);

    const uptrend = c1 < c2 && c2 < c3 && c3 < c4 && c4 < c5;
    const downtrend = c1 > c2 && c2 > c3 && c3 > c4 && c4 > c5;

    if (sma5 > sma10 && uptrend && rsi < 70 && momentum > noise * 0.6) return "CALL";
    if (sma5 < sma10 && downtrend && rsi > 30 && momentum > noise * 0.6) return "PUT";

    return false;
}

// 🧠 Execute Trade
function executeTrade(direction) {
    console.log(`📤 Sending ${direction} Trade | Stake: $${stake}`);
    isTradeInProgress = true;
    const proposal = {
        buy: 1,
        price: stake,
        parameters: {
            amount: stake,
            basis: "stake",
            contract_type: direction,
            currency: "USD",
            duration: 1,
            duration_unit: "t",
            symbol: "R_25"
        }
    };
    ws.send(JSON.stringify({ proposal: 1, subscribe: 1, ...proposal }));
}

// 📈 Performance Tracker
let profitTotal = 0;

function logPerformance() {
    const winRate = ((winCount / tradeCount) * 100).toFixed(2);
    const roi = (profitTotal / (baseStake * tradeCount) * 100).toFixed(2);

    console.log(`📊 Performance
-----------------------------
Trades:     ${tradeCount}
Wins:       ${winCount}
Losses:     ${lossCount}
Win Rate:   ${winRate}%
Total P/L:  $${profitTotal.toFixed(2)}
ROI:        ${roi}%
-----------------------------\n`);
}

// 📐 Moving Average
function simpleMA(arr) {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

// 💹 RSI Calculation
function calculateRSI(data, period = 14) {
    if (data.length < period + 1) return 50;

    const gains = [];
    const losses = [];

    for (let i = 1; i <= period; i++) {
        const diff = data[i] - data[i - 1];
        if (diff >= 0) gains.push(diff);
        else losses.push(Math.abs(diff));
    }

    const avgGain = gains.reduce((a, b) => a + b, 0) / period;
    const avgLoss = losses.reduce((a, b) => a + b, 0) / period;

    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
}
