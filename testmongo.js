// const mongoose = require("mongoose");

// const uri =
//   "mongodb+srv://dhanvi362007_db_user:6GZ2y4nY35R.FxV@cluster0.pneqn3m.mongodb.net/flatmatefinder?appName=Cluster0";

// mongoose.connect(uri)
//   .then(() => {
//     console.log("MongoDB connected successfully!");
//     process.exit(0);
//   })
//   .catch((err) => {
//     console.log("MongoDB connection failed:");
//     console.log(err);
//     process.exit(1);
//   });

  const dns = require("dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const mongoose = require("mongoose");

const uri =
  "mongodb+srv://dhanvi362007_db_user:6GZ2y4nY35R.FxV@cluster0.pneqn3m.mongodb.net/flatmatefinder?appName=Cluster0";

mongoose.connect(uri)
  .then(() => {
    console.log("MongoDB connected successfully!");
    process.exit(0);
  })
  .catch((err) => {
    console.log("MongoDB connection failed:");
    console.log(err);
    process.exit(1);
  });