var path = require("path");
var https = require("https");
var url = require("url");
var mongoose = require("mongoose");

// deactivate ssl cert check
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var internals = {};

/**
 * Return a function to check an app status by checking the response status code
 * The app is online if the status code is lower than 500
 * @param  {String} app App name
 * @return {Function} To be used in async workflow
 */
internals.getAppStatus = function(app){
    return function(done){
        var options = url.parse("https://" + app + ".herokuapp.com/");
        var callbacked = false;

        var request = https.request(options, function(response){
            if(callbacked) return;

            callbacked = true;

            var status = "offline";

            if(response.statusCode < 500){
                status = "online"
            }

            done(null, status);
        });

        request.on("error", function(error){
            console.error(error);

            if(callbacked) return;

            callbacked = true;

            done(error);
        });

        request.end();
    }
}

/**
 * Get the latest cronjobs
 * @param  {Number} limit   limit the result, defaults to 10
 * @async
 */
internals.getLatestCronjobs = function(limit){
    return function(done){
        q = mongoose.models.Cronjob.find()
        q.limit(limit || 10)
        q.sort("-created");
        q.exec(done);
    }
}

/**
 * Restarts an app
 * @param  {String}   app  App name
 * @param  {Function} done Callback function
 * @async
 */
internals.restart = function(app, done){
    pack.plugins.heroku.command(app, "restart", function(error){
        done(error);
    });
}

/**
 * Hapi register function
 */
exports.register = function(plugin, options, next){
    if(typeof process.env.APPS === "undefined"){
        throw new Error("process.env.APPS is undefined");
    }

    var apps = process.env.APPS.split(",");
    var basicAuthEnabled = (typeof process.env.BASIC_AUTH !== "undefined");

    /**
     * Exposes
     */
    plugin.expose("apps", apps);
    plugin.expose("getAppStatus", internals.getAppStatus);
    plugin.expose("getLatestCronjobs", internals.getLatestCronjobs);
    plugin.expose("restart", internals.restart);
    plugin.expose("basicAuthEnabled", internals.basicAuthEnabled);

    /**
     * Require plugins
     */

    if(basicAuthEnabled){
        plugin.require("hapi-auth-basic", function(error){
            if(error) throw error;

            var auth = process.env.BASIC_AUTH.split(":");

            plugin.auth.strategy('simple', 'basic', { validateFunc: function(username, password, callback){
                var isValid = (username === auth[0] && password === [1]);
                callback(null, isValid, {user: username});
            }});
        });
    }

    plugin.require(["./heroku", "./cronjobs"], function(error){
        if(error) throw error
    });

    /**
     * Register routes
     */
    plugin.route({
        method: "GET",
        path: "/assets/{file*}",
        handler: {
            directory: {
                path: path.join(path.dirname(process.mainModule.filename), "client", "public")
            }
        }
    });

    var auth = undefined;
    if(basicAuthEnabled){
        auth = {
            strategies: ["simple"],
            mode: "required"
        };
    }

    plugin.route({
        method: "*",
        path: "/app/restart/{app}",
        config: {
            auth: auth,
            handler: require("./routes/restart")
        }
    });

    plugin.route({
        method: "*",
        path: "/",
        config: {
            auth: auth,
            handler: require("./routes/index")
        }
    });

    next();
}