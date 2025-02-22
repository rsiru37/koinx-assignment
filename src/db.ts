import dotenv from 'dotenv';
dotenv.config();
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_DB_URL)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err: any) => console.error('Error connecting to MongoDB', err));
const Schema = mongoose.Schema;

const prices = new Schema({
  btc: Number,
  matic: Number,
  ethereum: Number,
  lastUpdated: { type: Date, default: Date.now }
});
const mkt_cap = new Schema({
  btc: Number,
  matic: Number,
  ethereum: Number,
  lastUpdated: { type: Date, default: Date.now }
});
const change = new Schema({
  btc: Number,
  matic: Number,
  ethereum: Number,
  lastUpdated: { type: Date, default: Date.now }
});

const priceModel = mongoose.model('prices',prices);
const marketcapModel = mongoose.model('marketcap',mkt_cap);
const changeModel = mongoose.model('change',change);

export {priceModel, marketcapModel, changeModel }