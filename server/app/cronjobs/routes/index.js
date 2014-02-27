var mongoose = require("mongoose");

/**
 * Shows all cronjobs
 * @url /cronjobs
 */
module.exports = function(request, reply){
    mongoose.models.Cronjob.find(function(error, cronjobs){
        if (error) return reply(error);

        reply.view("cronjobs/index", { cronjobs: cronjobs });
    });
}