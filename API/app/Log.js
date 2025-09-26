const DataValidationError = require('./DataValidationError');

class Log {
    constructor(data) {
        Log.validate(data);
        this.id = data.id;
        this.logLevel = data.log_level;
        this.logCategory = data.log_category;
        this.createdTimestamp = data.created_timestamp;
        this.loggedAtTimestamp = data.logged_at_timestamp;
        this.messageId = data.message_id;
        this.publishingServiceName = data.publishing_service_name;
        this.consumingServiceName = data.consuming_service_name;
        this.message = data.message;
    }

    static genericErrorLog(serviceName, messageContent, error) {
        return new Log({
            log_level: "ERROR",
            log_category: "RABBITMQ_CONSUMPTION_ERROR",
            created_timestamp: new Date(),
            message_id: require("uuid").v4(),
            logged_at_timestamp: new Date(),
            publishing_service_name: serviceName || "UNKNOWN",
            consuming_service_name: serviceName || "UNKNOWN",
            message: `Error occurred: ${error.message}, Context: ${messageContent}`
        });
    }

    static toDbLog(log) {
        return {
            id: log.id,
            log_level: log.logLevel,
            log_category: log.logCategory,
            created_timestamp: log.createdTimestamp,
            logged_at_timestamp: log.loggedAtTimestamp,
            message_id: log.messageId,
            publishing_service_name: log.publishingServiceName,
            consuming_service_name: log.consumingServiceName,
            message: log.message
        };
    }

    static fromDbLog(dbLog) {
        return new Log({
            id: dbLog.id,
            log_level: dbLog.log_level,
            log_category: dbLog.log_category,
            created_timestamp: dbLog.created_timestamp,
            logged_at_timestamp: dbLog.logged_at_timestamp,
            message_id: dbLog.message_id,
            publishing_service_name: dbLog.publishing_service_name,
            consuming_service_name: dbLog.consuming_service_name,
            message: dbLog.message
        });
    }

    static validate(data) {
        const errors = [];
        // id: optional, must be integer if present
        if (data.id !== undefined && (!Number.isInteger(data.id) || data.id < 0)) {
            errors.push(`id must be a positive integer. Failed value: ${data.id}`);
        }
        // log_level: required, string
        if (!data.log_level || typeof data.log_level !== 'string') {
            errors.push(`log_level is required and must be a string. Failed value: ${data.log_level}`);
        }
        // log_category: required, string
        if (!data.log_category || typeof data.log_category !== 'string') {
            errors.push(`log_category is required and must be a string. Failed value: ${data.log_category}`);
        }
        // created_timestamp: optional, must be valid date if present
        if (data.created_timestamp && isNaN(Date.parse(data.created_timestamp))) {
            errors.push(`created_timestamp must be a valid date. Failed value: ${data.created_timestamp}`);
        }
        // logged_at_timestamp: optional, must be valid date if present
        if (data.logged_at_timestamp && isNaN(Date.parse(data.logged_at_timestamp))) {
            errors.push(`logged_at_timestamp must be a valid date. Failed value: ${data.logged_at_timestamp}`);
        }
        // message_id: optional, must be valid uuid if present (loosened regex)
        if (data.message_id) {
            const uuidValid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(data.message_id);
            if (!uuidValid) {
                console.log('Validating DB message_id:', data.message_id, 'Result:', uuidValid);
                errors.push(`message_id must be a valid UUID. Failed value: ${data.message_id}`);
            }
        }
        // publishing_service_name: optional, string, max 200
        if (data.publishing_service_name && (typeof data.publishing_service_name !== 'string' || data.publishing_service_name.length > 200)) {
            errors.push(`publishing_service_name must be a string of max 200 chars. Failed value: ${data.publishing_service_name}`);
        }
        // consuming_service_name: optional, string, max 200
        if (data.consuming_service_name && (typeof data.consuming_service_name !== 'string' || data.consuming_service_name.length > 200)) {
            errors.push(`consuming_service_name must be a string of max 200 chars. Failed value: ${data.consuming_service_name}`);
        }
        // message: required, string
        if (!data.message || typeof data.message !== 'string') {
            errors.push(`message is required and must be a string. Failed value: ${data.message}`);
        }
        if (errors.length > 0) {
            console.log('Log validation errors:', errors);
            throw new DataValidationError('Log data validation failed', errors);
        }
        return true;
    }

    static validateApiLog(data) {
        const errors = [];
        // logLevel: required, string
        if (!data.logLevel || typeof data.logLevel !== 'string') {
            errors.push(`logLevel is required and must be a string. Failed value: ${data.logLevel}`);
        }
        // logCategory: required, string
        if (!data.logCategory || typeof data.logCategory !== 'string') {
            errors.push(`logCategory is required and must be a string. Failed value: ${data.logCategory}`);
        }
        // createdTimestamp: optional, must be valid date if present
        if (data.createdTimestamp && isNaN(Date.parse(data.createdTimestamp))) {
            errors.push(`createdTimestamp must be a valid date. Failed value: ${data.createdTimestamp}`);
        }
        // loggedAtTimestamp: optional, must be valid date if present
        if (data.loggedAtTimestamp && isNaN(Date.parse(data.loggedAtTimestamp))) {
            errors.push(`loggedAtTimestamp must be a valid date. Failed value: ${data.loggedAtTimestamp}`);
        }
        // messageId: optional, must be valid uuid if present (loosened regex)
        if (data.messageId) {
            const uuidValid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(data.messageId);
            if (!uuidValid) {
                console.log('Validating API messageId:', data.messageId, 'Result:', uuidValid);
                errors.push(`messageId must be a valid UUID. Failed value: ${data.messageId}`);
            }
        }
        // publishingServiceName: optional, string, max 200
        if (data.publishingServiceName && (typeof data.publishingServiceName !== 'string' || data.publishingServiceName.length > 200)) {
            errors.push(`publishingServiceName must be a string of max 200 chars. Failed value: ${data.publishingServiceName}`);
        }
        // consumingServiceName: optional, string, max 200
        if (data.consumingServiceName && (typeof data.consumingServiceName !== 'string' || data.consumingServiceName.length > 200)) {
            errors.push(`consumingServiceName must be a string of max 200 chars. Failed value: ${data.consumingServiceName}`);
        }
        // message: required, string
        if (!data.message || typeof data.message !== 'string') {
            errors.push(`message is required and must be a string. Failed value: ${data.message}`);
        }
        if (errors.length > 0) {
            throw new DataValidationError('API log data validation failed', errors);
        }
        return true;
    }

}

module.exports = { Log };