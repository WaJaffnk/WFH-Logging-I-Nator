const { Subscription, ServiceName } = require("wfh-rabbit-utilities");
const express = require('express');
const cors = require('cors');
const PORT = 8082;
const app = express();
const dotenv = require('dotenv');
dotenv.config();
console.log("env file: ", process.env.PUBLISH_TOKEN)

const DEFAULT_RABBIT_URL = process.env.DEFAULT_RABBIT_URL || "NO ENV VARIABLE SET UP FOR DEFAULT_RABBIT_URL";
const QUEUE_NAME = process.env.QUEUE_NAME || "NO ENV VARIABLE SET UP FOR QUEUE_NAME";
const SERVICE_NAME = ServiceName.loggingService || "LOGGING SERVICE - UNABLE TO GET SERVICE NAME FROM CONSTANTS"
const EXCHANGE_NAME = process.env.EXCHANGE_NAME || "NO ENV VARIABLE SET UP FOR EXCHANGE_NAME";
let subscription;

app.use(express.json());
app.use(cors());

app.get("/", (request, response) => {
    response.status(200).send("Welcome to the Workhorse for the WFH-Inator-Logging Service!!!");
})

const processMessage = (message) => {
    if (message.content) {
        console.log("CONSUMING MESSAGE: ", message.content.toString());
        //verify some items about this message,
        //log to database
        //ONCE rolling file management is set up- THEN 
        //.   text log to server as well
    }
}

app.listen(PORT, () => {
    console.log(`The WFH-Inator Logging Service is up and RUNNING!!! PORT: ${PORT}`);
    subscription = new Subscription(DEFAULT_RABBIT_URL, EXCHANGE_NAME, QUEUE_NAME, SERVICE_NAME);
    subscription.connect(processMessage);
})



