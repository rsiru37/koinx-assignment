import express from "express";
import cors from "cors"
import axios from "axios";
const cron = require('node-cron');

const app = express();
app.use(cors());
app.use(express.json());

//Running this every 2 hours
cron.schedule('0 */2 * * *', async() => {
    console.log('Running task every minute');
    const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,matic-network,ethereum&vs_currencies=usd`,
        {
            headers:
            {
                'accept': 'application/json',
                'x-cg-demo-api-key': process.env.API_KEY,
            }
    }
    )
    const prices = response.data;
    console.log("PRICES", prices);
  });

app.listen(3000, () => { console.log("App Started!")});