const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const prices = new Schema({
  btc: Number,
  matic: Number,
  ethereum: Number,
  lastUpdated: { type: Date, default: Date.now }
});

export const priceModel = mongoose.model('prices',prices);