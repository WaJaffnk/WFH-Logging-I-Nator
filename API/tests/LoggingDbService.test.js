const mockKnex = require("mock-knex");
const LoggingDbService = require("../app/LoggingDbService"); 
const { Log } = require("../app/Log");
const DataValidationError = require("../app/DataValidationError");
const DataNotFoundError = require("../app/DataNotFoundError");
const InvalidRequestError = require("../app/InvalidRequestError");
const testLogs = require("./testLogs.json");
const knex = require("knex")({ client: "pg" });

mockKnex.mock(knex);
const tracker = mockKnex.getTracker();
const dbService = new LoggingDbService(knex);

beforeAll(() => {
  tracker.install();
});

afterAll(() => {
  tracker.uninstall();
  mockKnex.unmock(knex);
});

describe("LoggingDbService class; Create tests", () => {
  it("should create a log entry and find it by id", async () => {
    // Use valid test log data in camelCase for API validation, including id
    const validLog = {
      id: 1001,
      logLevel: "INFO",
      logCategory: "system",
      createdTimestamp: "2024-06-17T08:15:23Z",
      loggedAtTimestamp: "2024-06-17T08:16:10Z",
      messageId: "a1e1b2c3-1111-4d5e-8f9a-1b2c3d4e5f01",
      publishingServiceName: "wfh-minio",
      consumingServiceName: "rabbitmq",
      message: "File uploaded successfully."
    };
    // Prepare DB response in snake_case
    tracker.on("query", (query) => {
      query.response([Log.toDbLog(validLog)]); // create returns new id
    });
    let domainLogResult = await dbService.create(validLog);
    Object.keys(validLog).forEach((key) => {
      expect(domainLogResult[key]).toEqual(validLog[key]);
    });
  });

  it("should throw an error when creating with invalid data", async () => {
    const invalidData = { foo: "bar", baz: 123 };
    // No need to set up tracker for validation error, as validation happens before DB call
    await expect(dbService.create(invalidData)).rejects.toThrow("API log data validation failed");
    await dbService.create(invalidData).catch((err) => {
      expect(err.name).toBe("DataValidationError");
      expect(err).toBeInstanceOf(Error);
      expect(err).toBeInstanceOf(DataValidationError);
      expect(err.details).toEqual(
        expect.arrayContaining([
          expect.stringContaining("logLevel is required"),
          expect.stringContaining("logCategory is required"),
          expect.stringContaining("message is required")
        ])
      );
    });
  });
});

/**
 *
 * Ideas:
 * Here are some additional findAll tests you might consider for more robust coverage:

        Filter by multiple fields at once (e.g., log_level and log_category).
            how to handle when you filtered EVERYTHING out.  Maybe a DataNotFoundError?
            so you can respond in api with "No logs found matching criteria"
        Filter by a date range (created_timestamp or logged_at_timestamp).
        Filter by message_id (exact match).
        Filter with no filters (should return all logs).
        Filter with a non-existent value (should return an empty array).
        Filter by publishing_service_name and consuming_service_name together.
        Filter by partial matches in publishing_service_name or consuming_service_name (if supported).
 */

describe("LoggingDbService class; findAll tests", () => {
  it("should filter logs by log_level", async () => {
    const expected = testLogs.filter((logger) => logger.log_level === "ERROR");
    tracker.on("query", (query) => {
      query.response(expected);
    });
    const logs = await dbService.findAll({ log_level: "ERROR" });
    expect(logs.every((logger) => logger.logLevel === "ERROR")).toBe(true);
    expect(logs.length).toBe(expected.length);
  });

  it("should filter logs by log_category", async () => {
    const expected = testLogs.filter((logger) => logger.log_category === "api");
    tracker.on("query", (query) => {
      query.response(expected);
    });
    const logs = await dbService.findAll({ log_category: "api" });
    expect(logs.every((logger) => logger.logCategory === "api")).toBe(true);
    expect(logs.length).toBe(expected.length);
  });

  it("should filter logs by publishing_service_name", async () => {
    const expected = testLogs.filter((logger) => logger.publishing_service_name === "workhorse-api");
    tracker.on("query", (query) => {
      query.response(expected);
    });
    const logs = await dbService.findAll({
      publishing_service_name: "workhorse-api"
    });
    expect(logs.every((logger) => logger.publishingServiceName === "workhorse-api")).toBe(true);
    expect(logs.length).toBe(expected.length);
  });

  it("should filter logs by consuming_service_name", async () => {
    const expected = testLogs.filter((logger) => logger.consuming_service_name === "rabbitmq");
    tracker.on("query", (query) => {
      query.response(expected);
    });
    const logs = await dbService.findAll({ consuming_service_name: "rabbitmq" });
    expect(logs.every((logger) => logger.consumingServiceName === "rabbitmq")).toBe(true);
    expect(logs.length).toBe(expected.length);
  });

  it("should filter logs by message substring", async () => {
    const expected = testLogs.filter((logger) => logger.message.includes("API request"));
    tracker.on("query", (query) => {
      query.response(expected);
    });
    const logs = await dbService.findAll({ message: "API request" });
    expect(logs.every((logger) => logger.message.includes("API request"))).toBe(true);
    expect(logs.length).toBe(expected.length);
  });
});

describe("LoggingDbService class; findById tests", () => {
  it("should return the correct log for a valid id", async () => {
    const expected = testLogs[0];
    tracker.on("query", (query) => {
      query.response(expected);
    });
    const log = await dbService.findById(expected.id);
    expect(log.id).toBe(expected.id);
    expect(log.logLevel).toBe(expected.log_level);
    expect(log.logCategory).toBe(expected.log_category);
    expect(log.message).toBe(expected.message);
  });

  it("should throw DataNotFoundError for a non-existent id", async () => {
    tracker.on("query", (query) => {
      query.response(undefined);
    });
    try {
      await dbService.findById(999999);
      throw new Error("Expected DataNotFoundError to be thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(DataNotFoundError);
      expect(err.message).not.toBe("Expected DataNotFoundError to be thrown");
      expect(err.message).toBe("Record 999999 not found in database");
    }
  });

  it("should throw DataNotFoundError for an invalid id (negative)", async () => {
    try {
      await dbService.findById(-1);
      throw new Error("Expected DataNotFoundError to be thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(DataNotFoundError);
      expect(err.message).not.toBe("Expected DataNotFoundError to be thrown");
      expect(err.message).toBe("Record -1 not found in database");
    }
  });

  it("should throw DataNotFoundError for a string id", async () => {
    try {
      await dbService.findById("crap-id");
      throw new Error("Expected DataNotFoundError to be thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(DataNotFoundError);
      expect(err.message).not.toBe("Expected DataNotFoundError to be thrown");
      expect(err.message).toBe("Record crap-id not found in database");
    }
  });
});

describe("LoggingDbService class; delete tests", () => {
  it("should throw InvalidRequestError when no startId is provided", async () => {
    tracker.on("query", (query) => {
      query.response(); // no response needed, should error
    });
    try {
      await dbService.delete();
      throw new Error("Expected InvalidRequestError to be thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(InvalidRequestError);
      expect(err.message).not.toBe("Expected InvalidRequestError to be thrown");
      expect(err.message).toBe("Invalid Request, undefined is not a valid Id");
    }
  });

  it("should delete logs from startId when only startId is provided", async () => {
    tracker.on("query", (query) => {
      console.log("Single ID delete:", query.method, query.bindings, query.sql);
      expect(query.method).toBe("del");
      expect(query.bindings).toContain(75); // startId
      query.response(1); // simulate success
    });
    await dbService.delete(75);
  });

  it("should delete logs between startId and endId", async () => {
    tracker.on("query", (query) => {
      console.log("Range delete:", query.method, query.bindings, query.sql);
      expect(query.method).toBe("del");
      expect(query.bindings).toEqual([137, 147]); // startId, endId
      query.response(10); // simulate success
    });
    await dbService.delete(137, 147);
  });

  it("should truncate all logs when truncateTable is true", async () => {
    tracker.on("query", (query) => {
      console.log("Truncate:", query.method, query.bindings, query.sql);
      expect(query.method).toBe("del"); // Knex uses 'del' for truncate
      expect(query.sql).toContain("truncate"); // Optional: check SQL contains 'truncate'
      query.response(1); // simulate success
    });
    await dbService.delete(null, null, true);
  });

  it("should delete a record when a valid id is passed in", async () => {
    const validId = testLogs[0].id;
    tracker.on("query", (query) => {
      console.log("Valid ID delete:", query.method, query.bindings, query.sql);
      expect(query.method).toBe("del");
      expect(query.bindings).toContain(validId);
      query.response(1); // simulate successful delete
    });
    await dbService.delete(validId);
  });
});
