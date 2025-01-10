"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const db_1 = require("./db");
const cron = require('node-cron');
const math = require('mathjs');
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
//Running this every 2 hours
cron.schedule('0 */2 * * *', () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield axios_1.default.get(`https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,matic-network,ethereum&vs_currencies=usd&include_market_cap=true&include_24hr_change=true`, {
        headers: {
            'accept': 'application/json',
            'x-cg-demo-api-key': process.env.API_KEY,
        }
    });
    const coins_data = response.data;
    yield db_1.priceModel.create({
        btc: coins_data['bitcoin'].usd,
        matic: coins_data['matic-network'].usd,
        ethereum: coins_data['ethereum'].usd,
        lastUpdated: Date.now()
    });
    yield db_1.marketcapModel.create({
        btc: coins_data['bitcoin'].usd_market_cap,
        matic: coins_data['matic-network'].usd_market_cap,
        ethereum: coins_data['ethereum'].usd_market_cap,
        lastUpdated: Date.now()
    });
    yield db_1.changeModel.create({
        btc: coins_data['bitcoin'].usd_24h_change,
        matic: coins_data['matic-network'].usd_24h_change,
        ethereum: coins_data['ethereum'].usd_24h_change,
        lastUpdated: Date.now()
    });
}));
app.get('/', (req, res) => {
    res.send("Koinx Assignment");
});
app.get('/stats', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { coin } = req.query;
    const latestprice = yield db_1.priceModel.findOne().sort({ lastUpdated: -1 });
    const latestmcap = yield db_1.marketcapModel.findOne().sort({ lastUpdated: -1 });
    const price_change = yield db_1.changeModel.findOne().sort({ lastUpdated: -1 });
    if (coin === 'bitcoin') {
        res.json({
            price: latestprice.btc,
            marketCap: latestmcap.btc,
            "24hChange": price_change.btc
        });
    }
    else if (coin === 'ethereum') {
        res.json({
            price: latestprice.ethereum,
            marketCap: latestmcap.ethereum,
            "24hChange": price_change.ethereum
        });
    }
    else if (coin === "matic") {
        res.json({
            price: latestprice.matic,
            marketCap: latestmcap.matic,
            "24hChange": price_change.matic
        });
    }
    else {
        res.status(400).json({ message: "Please select bitcoin, ethereum, matic" });
    }
}));
app.get('/deviation', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { coin } = req.query;
    const latestprices = yield db_1.priceModel.find().sort({ lastUpdated: -1 }).limit(100);
    if (coin === "bitcoin") {
        const b_prices = latestprices.map((item) => item.btc);
        res.json({ deviation: math.std(b_prices) });
    }
    else if (coin === "matic") {
        const m_prices = latestprices.map((item) => item.matic);
        res.json({ deviation: math.std(m_prices) });
    }
    else if (coin === "ethereum") {
        const e_prices = latestprices.map((item) => item.ethereum);
        res.json({ deviation: math.std(e_prices) });
    }
    else {
        res.status(400).json({ message: "Please select bitcoin, ethereum, matic" });
    }
}));
app.listen(3000, () => { console.log("App Started!"); });
