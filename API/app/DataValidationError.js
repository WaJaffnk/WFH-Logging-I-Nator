class DataValidationError extends Error {
  constructor(message = "DataValidationError", details = []) {
    super(message);
    this.name = "DataValidationError";
    this.details = details;
  }
}

module.exports = DataValidationError;