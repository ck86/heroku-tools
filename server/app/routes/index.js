var async = require("async");

/**
 * Start page
 * @url /
 */
module.exports = function(request, reply){
    var app = request.server.plugins.app;
    var fns = [];

    fns.push(app.getLatestCronjobs());
    app.apps.forEach(function(a){
        fns.push(app.getAppStatus(a));
    });

    async.parallel(fns, function(error, results){
        if(error) return reply(error);

        var context = {};

        context.cronjobs = results[0];
        context.apps = [];
        app.apps.forEach(function(app, i){
            context.apps.push({
                name: app,
                status: results[i + 1]
            });
        });

        reply.view("app/index", context);
    });
}