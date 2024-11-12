const mongoose = require("mongoose");

// password:H1H3uFW8Exw8t5T8
// username:vedashreeekbote10
mongoose
  .connect("mongodb://localhost:27017", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then("Connected to Database!")
  .catch((err) => console.error("MongoDB connection error:", err));

module.exports = mongoose;
