const express = require('express');
const { ServiceName } = require("wfh-rabbit-utilities");
const SERVICE_NAME = ServiceName.loggingService || "LOGGING SERVICE - UNABLE TO GET SERVICE NAME FROM CONSTANTS";
const log4js = require("log4js");
const logConfig = require("../log4js.config.json");
log4js.configure(logConfig);
const log4jsLogger = log4js.getLogger("files");

const rootPath = "/logs";
// Accept LoggingDbService as a parameter for flexibility
function logRouter(loggingDbService) {
    const router = express.Router();

    router.get(`${rootPath}/health/test-logs`, async (req, res) => {
        let message = req.query.message || "No message provided, this is a default test log entry.";
        try {
            const logData = {
                logLevel: "INFO",
                logCategory: "HEALTH_CHECK",
                createdTimestamp: new Date(),
                messageId: require("uuid").v4(),
                loggedAtTimestamp: new Date(),
                publishingServiceName: SERVICE_NAME,
                consumingServiceName: SERVICE_NAME,
                message
            };
            await loggingDbService.create(logData);
            log4jsLogger.info(`${SERVICE_NAME} - Test log entry created successfully.`);
            res.status(200).send("Test log entry created successfully.");
        } catch (error) {
            log4jsLogger.error(`${SERVICE_NAME} - error creating test log entry:`, error);
            res.status(500).send("Failed to create test log entry.");
        }
    });

    // GET all logs
    router.get(`${rootPath}/`, async (req, res) => {
        try {
            const logs = await loggingDbService.findAll();
            res.json(logs);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to fetch logs' });
        }
    });

    // POST a new log
    router.post(`${rootPath}/`, async (req, res) => {
        try {
            const logData = req.body;
            const newLog = await loggingDbService.create(logData);
            res.status(201).json(newLog);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to create log' });
        }
    });

    // GET a log by ID
    router.get(`${rootPath}/:id`, async (req, res) => {
        try {
            const log = await loggingDbService.findById(req.params.id);
            if (!log) {
                res.status(404).json({ error: 'Log not found' });
            } else {
                res.json(log);
            }
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to fetch log' });
        }
    });

    // DELETE a log by ID
    router.delete(`${rootPath}/:id`, async (req, res) => {
        try {
            const deleted = await loggingDbService.delete(req.params.id);
            if (!deleted) {
                return res.status(404).json({ error: 'Log not found' });
            }
            res.json({ success: true });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to delete log' });
        }
    });

    return router;
}

module.exports = logRouter;