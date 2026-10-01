const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
var createError = require('http-errors');
const userRoutes = require("./routes/userRoutes");
const roomRoutes = require("./routes/roomRoutes");
const requestRoutes = require("./routes/requestRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const reportRoutes = require("./routes/reportRoutes");
const favoriteRoutes =require("./routes/favoriteRoutes");
var express = require('express');
var mongoose= require('mongoose');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');


var app = express();
mongoose.connect(
  "mongodb://dhanvi362007_db_user:6GZ2y4nY35R.FxV@ac-564zlpc-shard-00-00.pneqn3m.mongodb.net:27017,ac-564zlpc-shard-00-01.pneqn3m.mongodb.net:27017,ac-564zlpc-shard-00-02.pneqn3m.mongodb.net:27017/flatmatefinder?ssl=true&replicaSet=atlas-f3u34b-shard-0&authSource=admin&appName=Cluster0"
)
.then(() => {
  console.log("MongoDB connected successfully");
  console.log("Database:", mongoose.connection.name);
})
.catch((error) => {
  console.log("MongoDB connection failed:", error);
});
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use("/api/users", userRoutes);

app.use("/api/rooms", roomRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/reports", reportRoutes);
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(
    "/api/favorites",
    favoriteRoutes
);
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/rooms', roomRoutes);
app.use("/uploads", express.static("public/uploads"));

// ─── Serve React frontend (production build) ────────────────────────────────
// The Vite build output lives at client/dist after running `npm run build`
// in the client folder. In development, use the Vite dev server instead.
const clientDist = path.join(__dirname, 'client', 'dist');
app.use(express.static(clientDist));

// SPA catch-all: any non-API route returns index.html so React Router works
app.get(/^(?!\/api).*/, (req, res) => {
  const indexFile = path.join(clientDist, 'index.html');
  res.sendFile(indexFile, (err) => {
    if (err) {
      // If dist doesn't exist yet (dev mode), fall through to 404
      res.status(404).json({ message: 'Run `npm run build` inside client/ to generate the frontend.' });
    }
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
app.use(
  "/uploads",
  express.static("public/uploads")
);

module.exports = app;
