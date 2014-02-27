var gulp = require("gulp");
var tasks = require("gulp-load-tasks")();

gulp.task("lib", function(){
    tasks["bower-files"]()
        .pipe(tasks.filter("**/*.js"))
        .pipe(tasks.concat("lib.js"))
        .pipe(gulp.dest("./public/scripts"))
});

gulp.task("assets", function(){
    tasks["bower-files"]()
        .pipe(tasks.filter("**/*.{svg,eot,ttf,woff,png,gif,jpeg,jpg}"))
        .pipe(gulp.dest("./public/assets"))
});

gulp.task("styles", function(){
    gulp.src("./src/styles/app.less")
        .pipe(tasks.less({
            paths: ["./bower_components/bootstrap/less"]
        }))
        .pipe(tasks.autoprefixer())
        .pipe(gulp.dest("./public/styles"))
});

gulp.task("scripts", function(){
    gulp.src("./src/scripts/app.js")
        .pipe(tasks.browserify())
        .pipe(gulp.dest("./public/scripts"))
});

gulp.task("default", function(){
    gulp.run("lib", "styles", "scripts", "assets");
});

gulp.task("watch", function(){
    gulp.run("default", function(){
        gulp.watch("./bower.json", function(){
            gulp.run("lib");
        });

        gulp.watch("./src/scripts/**", function(){
            gulp.run("scripts");
        });

        gulp.watch("./src/styles/**", function(){
            gulp.run("styles");
        });
    });
});