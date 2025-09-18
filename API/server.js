const { Subscription, ServiceName, LogMessage } = require("wfh-rabbit-utilities");
const dotenv = require('dotenv');
dotenv.config();


const log4js = require('log4js');
const logConfig = require('./log4js.config.json');
log4js.configure(logConfig);
const express = require('express');
const cors = require('cors');
const PORT = 8082;
const app = express();
const knexConfig = require('./knexfile.js')["development"];
const knex = require('knex')(knexConfig);

const DEFAULT_RABBIT_URL = process.env.DEFAULT_RABBIT_URL || "NO ENV VARIABLE SET UP FOR DEFAULT_RABBIT_URL";
const QUEUE_NAME = process.env.QUEUE_NAME || "NO ENV VARIABLE SET UP FOR QUEUE_NAME";
const SERVICE_NAME = ServiceName.loggingService || "LOGGING SERVICE - UNABLE TO GET SERVICE NAME FROM CONSTANTS"
const EXCHANGE_NAME = process.env.EXCHANGE_NAME || "NO ENV VARIABLE SET UP FOR EXCHANGE_NAME";
let subscription;
let log4jsLogger;

app.use(express.json());
app.use(cors());

app.get("/", (request, response) => {
    response.status(200).send("Welcome to the Workhorse for the WFH-Inator-Logging Service!!!");
})

app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

app.get('/health/test-logs', async (req, res) => {
    let message = req.query.message || "No message provided, this is a default test log entry.";

    try {
        await knex("logs").insert({
            log_level: "INFO",
            log_category: "HEALTH_CHECK",
            created_timestamp: new Date(),
            message_id: require('uuid').v4(),
            publishing_service_name: SERVICE_NAME,
            consuming_service_name: SERVICE_NAME,
            message: message
        });
        log4jsLogger.info(`${SERVICE_NAME} - Test log entry created successfully.`);
        res.status(200).send('Test log entry created successfully.');
    } catch (error) {
        log4jsLogger.error(`${SERVICE_NAME} - error creating test log entry:`, error);
        res.status(500).send('Failed to create test log entry.');
    }
});

app.get('/logs', async (req, res) => {
    try {
        const logs = await knex.select('*').from('logs').orderBy('logged_at_timestamp', 'desc').limit(100);
        res.status(200).json(logs);
    } catch (error) {
        log4jsLogger.error(`${SERVICE_NAME} - error fetching logs:`, error);
        res.status(500).send('Failed to fetch logs.');
    }
});

app.get('logs/', async (req, res) => {
    try { 
        let logs = await knex.select('*').from('logs').orderBy('logged_at_timestamp', 'desc').limit(100);

        res.status(200).json(logs);
    } catch (error) {
        if(log4jsLogger){
            log4jsLogger.error(`${SERVICE_NAME} - error fetching logs:`, error);
        }        
        res.status(500).send('Failed to fetch logs.');
    }
});

const processMessage = async (message) => {
    this.knex = knex;
    if (message.content) {
        try {
            log4jsLogger.info(`${SERVICE_NAME}: CONSUMING MESSAGE: `, message.content.toString());
            let logMessage = LogMessage.fromJson(message.content);
            await this.knex("logs").insert(logMessage.toLogTableInsert());
            log4jsLogger.info(`${SERVICE_NAME} - SUCCESS INSERTING RECORD TO DB`)
        }
        catch (error) {
            log4jsLogger.error(`${SERVICE_NAME} - error consuming message:`, error);
        }
    }
}

async function startServer() {
    log4jsLogger = log4js.getLogger("files");
    log4jsLogger.info(`RabbitMQ Config: DEFAULT_RABBIT_URL=${DEFAULT_RABBIT_URL}, EXCHANGE_NAME=${EXCHANGE_NAME}, QUEUE_NAME=${QUEUE_NAME}, SERVICE_NAME=${SERVICE_NAME}`);
    subscription = new Subscription(DEFAULT_RABBIT_URL, EXCHANGE_NAME, QUEUE_NAME, SERVICE_NAME);
    await subscription.connect(processMessage.bind(this));
    log4jsLogger.info(`${SERVICE_NAME} - logger is functioning`);
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server listening on ${PORT}`);
        log4jsLogger.info(`The LoggingInator is up and RUNNING!!! PORT: ${PORT}`);
    });
}

startServer();


