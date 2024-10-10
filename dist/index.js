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
const cron = require('node-cron');
const mongoose = require("mongoose");
mongoose.connect('mongodb+srv://rajsiruvani:bLvBLnUdOuDkP9Ux@cluster0.5he0n.mongodb.net/', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Error connecting to MongoDB', err));
const Schema = mongoose.Schema;
let obj_id;
const prices = new Schema({
    btc: Number,
    matic: Number,
    ethereum: Number,
});
const mkt_cap = new Schema({
    btc: Number,
    matic: Number,
    ethereum: Number,
});
const change = new Schema({
    btc: Number,
    matic: Number,
    ethereum: Number,
    // lastUpdated: { type: Date, default: Date.now }
});
const priceModel = mongoose.model('prices', prices);
const marketcapModel = mongoose.model('marketcap', mkt_cap);
const changeModel = mongoose.model('change', change);
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
//Running this every 2 hours
cron.schedule('* * * * *', () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Running task every minute');
    const response = yield axios_1.default.get(`https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,matic-network,ethereum&vs_currencies=usd&include_market_cap=true&include_24hr_change=true`, {
        headers: {
            'accept': 'application/json',
            'x-cg-demo-api-key': process.env.API_KEY,
        }
    });
    const coins_data = response.data;
    console.log("PRICES37", coins_data);
    yield priceModel.create({
        btc: coins_data['bitcoin'].usd,
        matic: coins_data['matic-network'].usd,
        ethereum: coins_data['ethereum'].usd
    });
    yield marketcapModel.create({
        btc: coins_data['bitcoin'].usd_market_cap,
        matic: coins_data['matic-network'].usd_market_cap,
        ethereum: coins_data['ethereum'].usd_market_cap
    });
    yield changeModel.create({
        btc: coins_data['bitcoin'].usd_24h_change,
        matic: coins_data['matic-network'].usd_24h_change,
        ethereum: coins_data['ethereum'].usd_24h_change
    });
    console.log("PD");
    //obj_id=price_data._id.toString();
    //console.log("OBJECT ID", obj_id);
})
//console.log(db_data);
);
app.get('/stats', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { coin } = req.query;
    const latestprice = yield priceModel.findOne().sort({ lastUpdated: -1 });
    const latestmcap = yield marketcapModel.findOne().sort({ lastUpdated: -1 });
    const price_change = yield changeModel.findOne().sort({ lastUpdated: -1 });
    if (coin === 'bitcoin') {
        res.json({
            price: latestprice.btc,
            marketCap: latestmcap.btc,
            "24hChange": price_change.btc
        });
    }
    if (coin === 'ethereum') {
        res.json({
            price: latestprice.eth,
            marketCap: latestmcap.eth,
            "24hChange": price_change.eth
        });
    }
    if (coin === "matic") {
        res.json({
            price: latestprice.matic,
            marketCap: latestmcap.matic,
            "24hChange": price_change.matic
        });
    }
}));
app.listen(3000, () => { console.log("App Started!"); });
