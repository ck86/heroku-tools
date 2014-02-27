var Hapi = require("hapi");
var mongoose = require("mongoose");
var pack = new Hapi.Pack()
var port = process.env.PORT || 3000
var server = pack.server(port, { labels: ["app"] });

global.pack = pack;

/**
 * Initializing mongoose
 */
if(typeof process.env.MONGO_URI === "undefined"){
    throw new Error("process.env.MONGO_URI is undefined");
}

mongoose.connect(process.env.MONGO_URI);
mongoose.connection.on("error", function(error){
    throw error;
});

/**
 * View options
 */
server.views({
    engines: {
        jade: "jade"
    },
    compileOptions: {
        pretty: (process.env.NODE_ENV === "development"),
        basedir: __dirname + "/views"
    },
    path: __dirname + "/views"
});

/**
 * Require core plugins
 */
// pack.require("./api", function(){});
pack.require("./app", function(){});

/**
 * Starting the server
 */
pack.start(function(){
    console.log("Server started at port " + (port));
});