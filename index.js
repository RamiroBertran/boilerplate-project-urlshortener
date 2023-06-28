require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const dns = require("dns");
const url = require("url");
const bodyParser = require("body-parser");
const mongoURL = process.env.MONGO_URI;
const mongoose = require("mongoose");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

const urlSchema = mongoose.Schema({
  url: String,
  shorturl: String,
});

const urlModel = mongoose.model("urlModel", urlSchema);

mongoose
  .connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to the database");
  })
  .catch((error) => {
    console.error("Failed to connect to the database: " + error);
  });

const urlResponse = (res, url, shorturl) => {
  res.json({ url: url, shorturl: shorturl });
};
app.post("/api/shorturl", (req, res) => {
  // --- Required variables ----
  const inputURL = req.body.url_input;
  const parseURL = url.parse(inputURL);
  const number = Math.round(Math.random() * 1000);
  // ---  Check if hostname is null ---
  if (parseURL.hostname === null) {
    res.json({ error: "invalid url" });
    return;
  }
  // --- Dns lookup method ---
  dns.lookup(parseURL.hostname, (err, address) => {
    if (err) {
      console.error(err);
      res.json({ error: "invalid url" });
      return;
    }
  });
  // -- Find out if the input url already in db --
  urlModel.findOne({ url: inputURL }, (error, url) => {
    if (error) {
      console.error(error);
    } else {
      if (url == null) {
        // -- Send url to database --
        const newURL = new urlModel({ url: inputURL, shorturl: number });
        newURL.save((err, url) => {
          if (err) {
            console.error(err);
          } else {
            urlResponse(res, inputURL, number);
          }
        });
      } else {
        urlResponse(res, url.url, url.shorturl);
      }
    }
  });
});

app.get("/api/shorturl/:shorturl", (req, res) => {
  urlModel.findOne({ shorturl: req.params.shorturl }, (err, url) => {
    if (err) {
      console.error(err);
    } else if (url == null) {
      console.log("null");
    } else {
      res.redirect(url.url);
    }
  });
});
app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
