var gulp = require("gulp"),
    nodemon = require("gulp-nodemon"),
    port = process.env.PORT,
    exec = require('child_process').exec;
gulp.task('default',function() {
     nodemon({
        script : 'server.js',
        ext: 'js',
        env: {
            PORT : port
        },
        ignore : ['./node_modules/**']
    }) 
    .on('restart', function () {
        console.log('Restarting srv.js on PORT: ' + port);
    });
});