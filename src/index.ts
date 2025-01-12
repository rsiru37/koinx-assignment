import express from "express";
import cors from "cors"
import axios from "axios";
import dotenv from 'dotenv';
dotenv.config();
import {priceModel, marketcapModel, changeModel} from "./db"
const cron = require('node-cron');
const math = require('mathjs');

const app = express();
app.use(cors());
app.use(express.json());

//Running this every 2 hours
cron.schedule('0 */2 * * *', async() => {
    const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,matic-network,ethereum&vs_currencies=usd&include_market_cap=true&include_24hr_change=true`,
        {
            headers:
            {
                'accept': 'application/json',
                'x-cg-demo-api-key': process.env.API_KEY,
            }
    });
    const coins_data = response.data;
        await priceModel.create({
            btc:coins_data['bitcoin'].usd,
            matic:coins_data['matic-network'].usd,
            ethereum:coins_data['ethereum'].usd,
            lastUpdated:Date.now()
        });
        await marketcapModel.create({
          btc:coins_data['bitcoin'].usd_market_cap,
          matic:coins_data['matic-network'].usd_market_cap,
          ethereum:coins_data['ethereum'].usd_market_cap,
          lastUpdated:Date.now()
        });
        await changeModel.create({
          btc:coins_data['bitcoin'].usd_24h_change,
          matic:coins_data['matic-network'].usd_24h_change,
          ethereum:coins_data['ethereum'].usd_24h_change,
          lastUpdated:Date.now()
        });
    }
  );

app.get('/', (req,res) => {
  res.send("Koinx Assignment, It might take around 50 seconds for server to wake up and start. Please Wait!");
})

app.get('/stats', async(req,res) => {
  const {coin} =  req.query;
  const latestprice = await priceModel.findOne().sort({ lastUpdated: -1 });
  const latestmcap = await marketcapModel.findOne().sort({ lastUpdated: -1 });
  const price_change = await changeModel.findOne().sort({ lastUpdated: -1 });
  if(coin==='bitcoin'){
    res.json({
      price: latestprice.btc,
      marketCap: latestmcap.btc,
      "24hChange":price_change.btc
    })
  }
  else if(coin === 'ethereum'){
    res.json({
      price: latestprice.ethereum,
      marketCap: latestmcap.ethereum,
      "24hChange":price_change.ethereum
    })
  }
  else if(coin === "matic"){
      res.json({
        price: latestprice.matic,
        marketCap: latestmcap.matic,
        "24hChange":price_change.matic
      })
    }
    else{
      res.status(400).json({message:"Please select bitcoin, ethereum, matic"});
    }
  }
)

app.get('/deviation', async(req,res) => {
  const {coin} =  req.query;
  const latestprices = await priceModel.find().sort({ lastUpdated: -1 }).limit(100);
  if(coin === "bitcoin"){
    const b_prices = latestprices.map((item:any) => item.btc);
    res.json({deviation: math.std(b_prices)})
  }
  else if(coin === "matic"){
    const m_prices = latestprices.map((item:any) => item.matic);
    res.json({deviation: math.std(m_prices)});
  }
  else if(coin === "ethereum"){
    const e_prices = latestprices.map((item:any) => item.ethereum);
    res.json({deviation: math.std(e_prices)})
  }
  else{
    res.status(400).json({ message:"Please select bitcoin, ethereum, matic"});
  }


})
app.listen(3000, () => { console.log("App Started!")});