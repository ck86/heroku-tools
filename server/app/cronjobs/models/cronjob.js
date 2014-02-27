var mongoose = require("mongoose");

/**
 * Cronjob schema
 */
var schema = new mongoose.Schema({
    app: { type: String, required: true, "default": "" },
    cronjob: { type: String, required: true },
    was_successful: { type: Boolean, "default": false },
    created: { type: Date, "default": Date.now },
    error_output: { type: String, "default": "" }
});

/**
 * Cronjob model
 */
module.exports = mongoose.model("Cronjob", schema)