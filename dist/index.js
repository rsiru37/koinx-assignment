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
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
cron.schedule('* * * * *', () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Running task every minute');
    const btc_price = yield axios_1.default.get(`https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,matic-network,ethereum&vs_currencies=usd`, {
        headers: {
            'accept': 'application/json',
            'x-cg-demo-api-key': process.env.API_KEY,
        }
    });
    console.log("PRICES", btc_price);
}));
app.listen(3000, () => { console.log("App Started!"); });
