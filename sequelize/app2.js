const morgan = require("morgan");
const models = require("./models");
const path = require("path");

const express = require("express");
const app = express();

/* set port */
app.set("port", process.env.PORT || 8080);

/* set common middlewares */
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res, next) => {
  models.newUser
    .findAll()
    .then((users) => {
      res.json(users);
    })
    .catch((err) => {
      console.error(err);
      next(err);
    });
});

app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "signup.html"));
});

app.post("/signup", (req, res, next) => {
  let body = req.body;

  models.newUser
    .create({
      username: body.username,
      password: body.password,
    })
    .then((newUser) => {
      console.log("signed up ~!");
      res.redirect("/");
    })
    .catch((err) => {
      console.error(err);
      next(err);
    });
});

/* link with port */
app.listen(app.get("port"), () => {
  console.log(app.get("port"), "port is connected...");
});
