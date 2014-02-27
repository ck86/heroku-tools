var Job = require("cron").CronJob;
var Cronjob = require("./models/cronjob");

/**
 * Internals
 * @type {Object}
 */
var internals = {};

/**
 * Runs a cronjob
 * @param  {String}   app       App name
 * @param  {String}   cronjob   cronjob
 * @param  {Function} callback  Callback function
 */
internals.runCronjob = function(app, cronjob, callback){
    callback = callback || function(){}

    var heroku = pack.plugins.heroku;

    heroku.command(app, "run cronjob " + cronjob, function(error, result){
        Cronjob.create({
            app: app,
            cronjob: cronjob,
            was_successful: (error === null),
            error_output: error ? error.message : null
        }, callback);
    });
}

/**
 * Get all jobs defined by process.env.CRONJOBS
 * @return {Array}
 */
internals.getJobs = function(){
    return process.env.CRONJOBS.split(",").map(function(job){
        return job.split(":").reduce(function(prev, curr, i){
            switch(i){
                case 0:
                    prev.app = curr;
                    break;
                case 1:
                    prev.cronTime = curr;
                    break;
                case 2:
                    prev.onTick = function(){
                        internals.runCronjob(prev.app, "every-five-minutes")
                    }
                    break;
            }

            return prev;
        }, {});
    });
}

/**
 * Hapi register function
 */
exports.register = function(plugin, options, next){
    if(typeof process.env.CRONJOBS === "undefined"){
        throw new Error("process.env.CRONJOBS is undefined");
    }

    var jobs = internals.getJobs();

    /**
     * Dependencies
     */
    plugin.dependency(["heroku"]);

    /**
     * Exposes
     */
    plugin.expose("runCronjob", internals.runCronjob);

    /**
     * Register routes
     */
    var auth = undefined;
    if(plugin.plugins.app.basicAuthEnabled){
        auth = {
            strategies: ["simple"],
            mode: "required"
        };
    }

    plugin.route({
        method: "GET",
        path: "/cronjobs",
        config: {
            auth: auth,
            handler: require("./routes/index")
        }
    });

    /**
     * Register cronjob jobs
     */
    jobs.forEach(function(job){
        new Job(job);
    });

    next();
}