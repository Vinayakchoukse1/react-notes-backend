const mongoose = require("mongoose");

const connectToMongo = () => {
  const mongoURI =
    "mongodb+srv://arpandesai0:ad1234@cluster0.82awn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
  mongoose.connect(mongoURI, (err) => {
    if (err) console.log("Failed to connect ot database");
    else console.log("Mongo connected :)");
  });
};

module.exports = connectToMongo;
