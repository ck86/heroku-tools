var spawn = require("child_process").spawn;

var internals = {};

/**
 * Runs a heroku toolbelt command
 * @param  {String}   app       App name
 * @param  {String}   cmd       The command
 * @param  {Function} callback  Callback function
 */
internals.command = function(app, cmd, callback){
    callback = callback || function(){}

    var callbacked = false;

    var errors = [];
    var datas = [];
    var created = false;
    var args = cmd.split(" ");

    args.push("--app");
    args.push(app);

    var fullcmd = "heroku " + args.join(" ");

    var heroku = spawn("heroku", args);

    heroku.on("error", function(error){
        if (callbacked) return;
        
        callbacked = true;

        callback(new Error(error));
    });

    heroku.on("close", function(error){
        if (callbacked) return;
        
        callbacked = true;

        callback(null, datas.join("\n"));
    });

    heroku.stdout.on("data", function(data){
        datas.push(data.toString("utf8"));
        console.log(data.toString("utf8"));
    });

    heroku.stderr.on("data", function(data){
        errors.push(data.toString("utf8"));
        console.error(data.toString("utf8"));
    });
}

/**
 * Hapi register function
 */
exports.register = function(plugin, options, next){
    /**
     * Exposes
     */
    plugin.expose("command", internals.command);

    next();
}