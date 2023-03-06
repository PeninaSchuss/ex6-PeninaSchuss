var express = require('express');
var path = require('path');
var session = require('express-session')
// Parse Cookie header and populate req.cookies with an object keyed by the cookie names
// (https://www.npmjs.com/package/cookie-parser)
var cookieParser = require('cookie-parser');

var fs = require('fs')
var logger = require('morgan'); // logging middleware (https://www.npmjs.com/package/morgan)

//var loginRouter = require('./routes/login');
var apiRouter = require('./routes/login');
var indexRouter = require('./routes/resp');

var app = express();
// express views folder and engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


// set up logging - all HTTP requests will be logged to the http.log file
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'http.log'), { flags: 'a' })

app.use(express.static(path.join(__dirname, 'public')));
app.use(logger('combined', { stream: accessLogStream }));


// built in express middleware parses incoming requests with JSON
app.use(express.json());


// extended false means you can not post "nested object" {a {b:c}}
// parses incoming requests with urlencoded
app.use(express.urlencoded({ extended: false }));

// COOKIES
app.use(cookieParser());

// make public folder visible for static files (client side javascript)
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret:"somelongstringvalue",
  resave: false,
  saveUninitialized: false,
  maxAge: 1000*60*60*24*7,
}))


app.use('/index', indexRouter);
//app.use('/login', loginRouter);
app.use('/', apiRouter);


app.use(function (req, res, next) {
  res.status(404).send("Oops, looks like you landed at the wrong URL!")
})

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  //res.status(err.status || 500);
  res.render('error');// use a default error page error.ejs
});



module.exports = app;
