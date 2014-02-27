var async = require("async");

/**
 * Restarting an app
 * @url /app/restart/{app}
 */
module.exports = function(request, reply){
    var app = request.params.app;

    request.server.plugins.app.restart(app, function(error){
        if(error) return reply(error);

        reply().redirect("/");
    });
}