"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.priceModel = void 0;
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const prices = new Schema({
    btc: Number,
    matic: Number,
    ethereum: Number,
    lastUpdated: { type: Date, default: Date.now }
});
exports.priceModel = mongoose.model('prices', prices);
