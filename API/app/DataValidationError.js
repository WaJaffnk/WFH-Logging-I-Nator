class DataValidationError extends Error {
    constructor(message, details) {
        super(message);
        this.name = 'DataValidationError';
        this.details = details;
    }
}

module.exports = DataValidationError;