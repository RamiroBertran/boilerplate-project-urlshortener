require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
// url require('url') allows to call methods such as parse that will be need to check the url
const url = require("url");
// dns allows to use method such as dns.lookup to check again if the url is a well input
const dns = require("dns");
// bodyParser allows us to get the input from the user
const bodyParser = require("body-parser");
// uri contain the url to mongose database
const uri = process.env.MONGO_URI;
// Conect to monogose database
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// Create a mongoose schema

const form_url = new mongoose.Schema({
  url: String,
  shorturl: Number,
});

// Create a mongoose model
const User_url = mongoose.model("User_url", form_url);
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint

app.post("/api/shorturl", (req, res) => {
  // url_input contain the value of the url input form
  const url_input = req.body.url_input;
  // random_surl contain a random number between 1 and 10000 that will be asigned to a the url that was send trough the formulaire
  let random_surl = Math.round(Math.random() * 10000);
  let number_to_string = `${random_surl}`;
  console.log(typeof number_to_string);
  // parse url call the method parse trough url methods and keeping the value in parseUrl variable
  const parseUrl = url.parse(url_input);
  // if the hostname is null meaning that the url input in the form it's a wrong one
  if (parseUrl.hostname == null) {
    // case it is null, return an status of 400 and a json object with a key of 'error' and a value of 'invalid url';
    res.status(400).json({ error: "invalid url" });
  } else {
    // in case the pass the first filter it will be check trought the second filter wich verify using dns lookup method, giving to it the hostname, and then a call back function that console an error if there is a problem
    dns.lookup(parseUrl.hostname, (err, address) => {
      if (err) {
        console.error(err);
        return;
      } else {
        // In case the two filter are passed, then, it will respond with a json object that contain the entire url, and the shorturl, that is the random number given to the input url
        const newUrl = new User_url({
          url: parseUrl.href, 
          shorturl:random_surl;  
        });
        newUrl.save((err) => {
          if(err) {
            console.error(err); 
            console.log("An erro has ocurred"); 
        } else {
            console.log("User saved succesfully"); 
        }
        ); 
        res.json(newUrl);
      }
    });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
