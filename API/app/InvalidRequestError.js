class InvalidRequestError extends Error {
    constructor(message = 'Invalid request') {
        super(message);
        this.name = 'InvalidRequest';
        this.status = 400;
        Error.captureStackTrace(this, InvalidRequestError);
    }
}

module.exports = InvalidRequestError