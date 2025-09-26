const { Log } = require("./Log");
const DataNotFoundError = require("./DataNotFoundError");
const InvalidRequestError = require("./InvalidRequestError");

class LoggingDbService {
    constructor(knex) {
        this.knex = knex;
    }

    async findAll(filters = {}) {
        try {
            let query = this.knex("logs").select("*");
            if (filters.log_level)
                query = query.where("log_level", filters.log_level);
            if (filters.log_category)
                query = query.where("log_category", filters.log_category);
            if (filters.created_timestamp)
                query = query.where("created_timestamp", filters.created_timestamp);
            if (filters.logged_at_timestamp)
                query = query.where("logged_at_timestamp", filters.logged_at_timestamp);
            if (filters.message_id)
                query = query.where("message_id", filters.message_id);
            if (filters.publishing_service_name)
                query = query.where(
                    "publishing_service_name",
                    filters.publishing_service_name
                );
            if (filters.consuming_service_name)
                query = query.where(
                    "consuming_service_name",
                    filters.consuming_service_name
                );
            if (filters.message)
                query = query.where("message", "like", `%${filters.message}%`);
            const logs = await query;
            return logs.map((log) => new Log(log));
        } catch (error) {
            console.error("Error in LogDatabase.findAll:", error);
            throw error;
        }
    }

    async findById(id) {
        try {
            const log = await this.knex("logs").where({ id }).first();
            if (!log) {
                throw new DataNotFoundError(`Record ${id} not found in database`);
            }
            return new Log(log);
        } catch (error) {
            console.error("Error in LogDatabase.findById:", error);
            throw error;
        }
    }

    async create(data) {
        try {
            Log.validateApiLog(data);
            const dbLog = Log.toDbLog(data);
            const insertedLog = await this.knex("logs").insert(dbLog).returning("*");
            let apiResult = Log.fromDbLog(insertedLog[0]);
            return apiResult;
        } catch (error) {
            console.error("Error in LogDatabase.create:", error);
            throw error;
        }
    }

    async delete(startId, endId, truncateTable) {
        try {
            // TODO: REMOVE BEFORE RELEASE:
            if (truncateTable === true) {
                return this.knex("logs").truncate();
            }
            if (startId === undefined) {
                throw new InvalidRequestError(
                    `Invalid Request, ${startId} is not a valid Id`,
                );
            }
            if (endId !== undefined) {
                if (endId <= startId) {
                    throw new InvalidRequestError(
                        `Invalid Request, endId ${endId} must be greater than startId ${startId}`,
                    );
                }
                return this.knex("logs").whereBetween("id", [startId, endId]).del();
            }
            return this.knex("logs").where("id", startId).del();
        } catch (error) {
            console.error("Error in LogDatabase.delete:", error);
            throw error;
        }
    }
}

module.exports = LoggingDbService;