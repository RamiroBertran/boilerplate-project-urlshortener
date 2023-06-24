require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const url = require("url");
const dns = require("dns");
const bodyParser = require("body-parser");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint

app.post("/api/shorturl", (req, res) => {
  const url_input = req.body.url_input;
  console.log(url_input);
  const parseUrl = url.parse(url_input);
  if (parseUrl.hostname == null) {
    res.status(400).json({ error: "invalid url" });
  } else {
    dns.lookup(parseUrl.hostname, (err, address) => {
      if (err) {
        console.error(err);
        return;
      } else {
        res.json({ url: parseUrl.href });
      }
    });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
