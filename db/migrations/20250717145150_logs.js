/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable("logs", (table => {
    table.increments();
    table.string("log_level").notNullable();
    table.string("log_category").notNullable();
    table.timestamp("created_timestamp");
    table.timestamp("logged_at_timestamp").defaultTo(knex.fn.now());
    table.uuid("message_id");
    table.string("publishing_service_name", 200);
    table.string("consuming_service_name", 200);
    table.text("message").notNullable();
  }))
};
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.raw('TRUNCATE TABLE logs RESTART IDENTITY CASCADE;')
    .then(() => {
      return knex.schema.dropTable('logs');
    });
};
