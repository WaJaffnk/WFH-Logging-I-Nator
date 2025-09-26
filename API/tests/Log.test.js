const { Log } = require("../app/Log");
const DataValidationError = require("../app/DataValidationError");

describe("Log class", () => {
  it("should map toDbLog and fromDbLog correctly", () => {
    const dbData = {
      id: 1,
      log_level: "INFO",
      log_category: "system",
      created_timestamp: "2024-06-17T08:15:23Z",
      logged_at_timestamp: "2024-06-17T08:16:10Z",
      message_id: "a1e1b2c3-1111-4d5e-8f9a-1b2c3d4e5f01",
      publishing_service_name: "wfh-minio",
      consuming_service_name: "rabbitmq",
      message: "File uploaded successfully."
    };
    const log = Log.fromDbLog(dbData);
    const mapped = Log.toDbLog(log);
    expect(mapped).toEqual(dbData);
  });

  it("should validate correct DB data", () => {
    const validDbData = {
      id: 2,
      log_level: "ERROR",
      log_category: "api",
      created_timestamp: "2024-06-18T10:22:45Z",
      logged_at_timestamp: "2024-06-18T10:23:01Z",
      message_id: "a1e1b2c3-2222-4d5e-8f9a-1b2c3d4e5f02",
      publishing_service_name: "workhorse-api",
      consuming_service_name: "wfh-verdaccio",
      message: "Failed to fetch user data."
    };
    expect(() => Log.validate(validDbData)).not.toThrow();
  });

  it("should validate correct API data", () => {
    const validApiData = {
      id: 3,
      logLevel: "WARN",
      logCategory: "storage",
      createdTimestamp: "2024-06-19T12:05:12Z",
      loggedAtTimestamp: "2024-06-19T12:05:45Z",
      messageId: "a1e1b2c3-3333-4d5e-8f9a-1b2c3d4e5f03",
      publishingServiceName: "wfh-verdaccio",
      consumingServiceName: "wfh-minio",
      message: "Storage quota nearing limit."
    };
    expect(() => Log.validateApiLog(validApiData)).not.toThrow();
  });

  it("should throw DataValidationError for each DB validation rule", () => {
    const invalidDbData = {
      id: -1, // invalid id
      log_level: 123, // not string
      log_category: null, // not string
      created_timestamp: "not-a-date", // invalid date
      logged_at_timestamp: "not-a-date", // invalid date
      message_id: "bad-uuid", // invalid uuid
      publishing_service_name: "x".repeat(201), // too long
      consuming_service_name: 123, // not string
      message: null // not string
    };
    try {
      Log.validate(invalidDbData);
      throw new Error("Expected DataValidationError to be thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(DataValidationError);
      expect(err.message).not.toBe("Expected DataValidationError to be thrown");
      expect(err.details).toEqual(
        expect.arrayContaining([
          "id must be a positive integer. Failed value: -1",
          "log_level is required and must be a string. Failed value: 123",
          "log_category is required and must be a string. Failed value: null",
          "created_timestamp must be a valid date. Failed value: not-a-date",
          "logged_at_timestamp must be a valid date. Failed value: not-a-date",
          "message_id must be a valid UUID. Failed value: bad-uuid",
          `publishing_service_name must be a string of max 200 chars. Failed value: ${invalidDbData.publishing_service_name}`,
          "consuming_service_name must be a string of max 200 chars. Failed value: 123",
          "message is required and must be a string. Failed value: null"
        ])
      );
    }
  });

  it("should throw DataValidationError for each API validation rule", () => {
    const invalidApiData = {
      id: -1, // invalid id (should not be validated)
      logLevel: null, // not string
      logCategory: 123, // not string
      createdTimestamp: "not-a-date", // invalid date
      loggedAtTimestamp: "not-a-date", // invalid date
      messageId: "bad-uuid", // invalid uuid
      publishingServiceName: "x".repeat(201), // too long
      consumingServiceName: 123, // not string
      message: null // not string
    };
    try {
      Log.validateApiLog(invalidApiData);
      throw new Error("Expected DataValidationError to be thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(DataValidationError);
      expect(err.message).not.toBe("Expected DataValidationError to be thrown");
      expect(err.details).toEqual(
        expect.arrayContaining([
          "logLevel is required and must be a string. Failed value: null",
          "logCategory is required and must be a string. Failed value: 123",
          "createdTimestamp must be a valid date. Failed value: not-a-date",
          "loggedAtTimestamp must be a valid date. Failed value: not-a-date",
          "messageId must be a valid UUID. Failed value: bad-uuid",
          `publishingServiceName must be a string of max 200 chars. Failed value: ${invalidApiData.publishingServiceName}`,
          "consumingServiceName must be a string of max 200 chars. Failed value: 123",
          "message is required and must be a string. Failed value: null"
        ])
      );
    }
  });
});
