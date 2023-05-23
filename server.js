// Dotenv is a zero-dependency module that loads environment variables from a .env file into process.env
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
//cors manages the urls which can access our server
const cors = require("cors");
const corsOptions = {
  origin: '*',
  credentials: true };
//Simple express middleware for uploading files.
const fileUpload = require("express-fileupload");
//manages cookies
const cookieParser = require("cookie-parser");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(
  fileUpload({
    useTempFiles: true,
  })
);
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,UPDATE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
  // req.headers.origin('https://646d279ef8b23e06a23436a3--ninja-shopper.netlify.app/')
  next();
});

//Routes (url begins with /user and the rest is dependant on userRoutes)
app.use("/user", require("./routes/userRouter"));
app.use("/api", require("./routes/categoryRouter"));
app.use("/api", require("./routes/upload"));
app.use("/api", require("./routes/productRouter"));
app.use("/api", require("./routes/paymentRouter"));


// connect to MongoDB
const URI = process.env.MONGODB_URL;
mongoose.connect(URI, (err) => {
  if (err) throw err;
  console.log("Connected to MongoDB");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
