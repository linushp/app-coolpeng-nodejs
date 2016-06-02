var express = require('express');
var session = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var partials = require('express-partials');
var cpUtil = require('./routes/utils/cp-util');
var appConfig = require('./app-config');


var routes = require('./routes/index');
var users = require('./routes/users');
var blog = require('./routes/blog');
var install = require('./routes/install');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
//app.set("view options",{});

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(session({
    secret: 'coolpeng',
    name: 'session_id',   //这里的name值得是cookie的name，默认cookie的name是：connect.sid
    cookie: {maxAge: 1000 * 60 * 30},  //设置maxAge是80000ms，即80s后session和相应的cookie失效过期
    resave: false,
    saveUninitialized: true
}));

app.use("/public", express.static(path.join(__dirname, 'public')));
app.use("/bower_components", express.static(path.join(__dirname, 'bower_components')));
app.use(partials());
app.use(cpUtil.smartParseAndRender());

app.use('/', routes);
app.use('/users', users);
app.use('/blog', blog);
app.use('/install', install);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (appConfig._ENVIRONMENT === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.send(err.message);
        res.end(err.status);
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


var server = require('http').createServer(app);
var io = require('socket.io')(server);
io.on('connection', function () { /* … */
});
server.listen(appConfig.SERVE_PORT);


module.exports = app;
