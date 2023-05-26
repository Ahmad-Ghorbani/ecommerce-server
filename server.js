// Dotenv is a zero-dependency module that loads environment variables from a .env file into process.env
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
//cors manages the urls which can access our server
const cors = require("cors");
const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
};
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
