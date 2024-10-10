import express from "express";
import cors from "cors"
import axios from "axios";
const cron = require('node-cron');

const app = express();
app.use(cors());
app.use(express.json());


app.listen(3000, () => { console.log("App Started!")});