class DataNotFoundError extends Error {
  constructor(message = "Data not found") {
    super(message);
    this.name = "DataNotFoundError";
    this.statusCode = 404;
    Error.captureStackTrace(this, DataNotFoundError);
  }
}

module.exports = DataNotFoundError;