const functions = require("firebase-functions");
const express = require("express");
const request = require("request");

global.access_token = "";

const app = express();

var spotify_client_id = "ac7ee957aa39442d899f8fb58d2c0ddf";
var spotify_client_secret = "97eb8714ab974294b5344be11866957d";

var spotify_redirect_uri =
  "https://us-central1-spotter-33098.cloudfunctions.net/app/auth/callback";

var generateRandomString = function (length) {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

app.get("/works33", (req, res) => {
  res.status(200).send({ data: "yo yo yo got em" });
});

app.get("/auth/login", (req, res) => {
  var scope = "streaming user-read-email user-read-private user-library-read";
  var state = generateRandomString(16);

  var auth_query_parameters = new URLSearchParams({
    response_type: "code",
    client_id: spotify_client_id,
    scope: scope,
    redirect_uri: spotify_redirect_uri,
    state: state,
  });

  res.redirect(
    "https://accounts.spotify.com/authorize/?" +
      auth_query_parameters.toString()
  );
});

app.get("/auth/callback", (req, res) => {
  var code = req.query.code;

  var authOptions = {
    url: "https://accounts.spotify.com/api/token",
    form: {
      code: code,
      redirect_uri: spotify_redirect_uri,
      grant_type: "authorization_code",
    },
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(spotify_client_id + ":" + spotify_client_secret).toString(
          "base64"
        ),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    json: true,
  };

  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      access_token = body.access_token;
      res.redirect("https://spotter-33098.web.app/");
    }
  });
});

app.get("/auth/token", (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.json({ access_token: access_token });
  access_token = "";
});

exports.app = functions.https.onRequest(app);
