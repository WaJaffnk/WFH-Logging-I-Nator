const express = require("express");
const request = require("supertest");
const logRouter = require("../app/Router");

describe("logRouter", () => {
  let app;
  let mockLoggingDbService;

  beforeEach(() => {
    mockLoggingDbService = {
      findAll: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn()
    };
    app = express();
    app.use(express.json());
    app.use("/", logRouter(mockLoggingDbService)); // Mount at root
  });

  describe("GET /logs", () => {
    it("should return all logs", async () => {
      const logs = [{ id: 1, message: "test" }];
      mockLoggingDbService.findAll.mockResolvedValue(logs);
      const res = await request(app).get("/logs");
      expect(res.status).toBe(200);
      expect(res.body).toEqual(logs);
      expect(mockLoggingDbService.findAll).toHaveBeenCalled();
    });

    it("should handle errors", async () => {
      mockLoggingDbService.findAll.mockRejectedValue(new Error("fail"));
      const res = await request(app).get("/logs");
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Failed to fetch logs" });
    });
  });

  describe("POST /logs", () => {
    it("should create a new log", async () => {
      const logData = { message: "new log" };
      const createdLog = { id: 2, ...logData };
      mockLoggingDbService.create.mockResolvedValue(createdLog);
      const res = await request(app).post("/logs").send(logData);
      expect(res.status).toBe(201);
      expect(res.body).toEqual(createdLog);
      expect(mockLoggingDbService.create).toHaveBeenCalledWith(logData);
    });

    it("should handle errors", async () => {
      mockLoggingDbService.create.mockRejectedValue(new Error("fail"));
      const res = await request(app).post("/logs").send({ message: "fail" });
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Failed to create log" });
    });
  });

  describe("GET /logs/:id", () => {
    it("should return a log by id", async () => {
      const log = { id: "123", message: "found" };
      mockLoggingDbService.findById.mockResolvedValue(log);
      const res = await request(app).get("/logs/123");
      expect(res.status).toBe(200);
      expect(res.body).toEqual(log);
      expect(mockLoggingDbService.findById).toHaveBeenCalledWith("123");
    });

    it("should return 404 if log not found", async () => {
      mockLoggingDbService.findById.mockResolvedValue(null);
      const res = await request(app).get("/logs/999");
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Log not found" });
    });

    it("should handle errors", async () => {
      mockLoggingDbService.findById.mockRejectedValue(new Error("fail"));
      const res = await request(app).get("/logs/123");
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Failed to fetch log" });
    });
  });

  describe("DELETE /logs/:id", () => {
    it("should delete a log by id", async () => {
      mockLoggingDbService.delete.mockResolvedValue(true);
      const res = await request(app).delete("/logs/123");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true });
      expect(mockLoggingDbService.delete).toHaveBeenCalledWith("123");
    });

    it("should return 404 if log not found", async () => {
      mockLoggingDbService.delete.mockResolvedValue(false);
      const res = await request(app).delete("/logs/999");
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Log not found" });
    });

    it("should handle errors", async () => {
      mockLoggingDbService.delete.mockRejectedValue(new Error("DB must have broken..."));
      const res = await request(app).delete("/logs/123");
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Failed to delete log" });
    });
  });
});
