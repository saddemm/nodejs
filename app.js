var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');


var index = require('./routes/index');
var play = require('./routes/play');

var app = express();

var server = require('http').Server(app);
var io = require('socket.io')(server);



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'twig');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));
app.use('/node_modules',  express.static(__dirname + '/node_modules'));

app.use('/', index);
app.use('/play', play);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



io.on('connection', function(socket){

  console.log('a user connected');


  socket.on('disconnect', function(){
    console.log('user disconnected');
    console.log(io.sockets.adapter.rooms)
  });




  socket.on('createRoom', function (room) {
    console.log("Created: "+room);
    socket.join(room);
    console.log(io.sockets.adapter.rooms[room]);
  });

  socket.on('joinRoom', function (room) {

    if (io.sockets.adapter.rooms[room]){

      if (io.sockets.adapter.rooms[room].length< 2 ) {
        console.log("Joined: " + room);
        socket.join(room);
        io.to(room).emit('joinRoom');

      }else{
        io.to(socket.id).emit('error',2);
      }
    }else{
      console.log('dosent exist!');
      io.to(socket.id).emit('error',1);
    }


  });

  socket.on('playPressed', function(room){
    console.log('playpressed Now !:');
    io.to(room).emit('playPressed');
  });



});

module.exports = {app: app, server: server};
