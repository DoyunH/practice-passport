const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const models = require("./sequelize/models");
const path = require("path");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const app = express();

// set port
app.set("port", process.env.PORT || 8080);

// common middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser("passportExample"));
app.use(
  session({
    secret: "passportExample",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
    },
  })
);

// userData is from database
let userData;

// passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Session handling - serializeUser (only once when user login)
passport.serializeUser((user, done) => {
  console.log("serializeUser");
  done(null, user.username); // save user name to req.session.passport.user
});

// session handling - deserializeUser (every time when user access)
passport.deserializeUser((id, done) => {
  console.log("deserializeUser");
  done(null, userData); // send to req.user
});

// passport local strategy
passport.use(
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
      session: false,
    },
    (username, password, done) => {
      // check username and password from DB
      models.newUser
        .findOne({
          where: {
            username: username,
            password: password,
          },
        })
        .then((user) => {
          if (!user) {
            return done(null, false, { message: "Incorrect username." });
          }
          userData = user;
          return done(null, user);
        })
        .catch((err) => {
          console.error(err);
          done(err);
        });
    }
  )
);

app.get("/", (req, res) => {
  if (!req.user) {
    res.sendFile(__dirname + "/index.html");
  } else {
    console.log(req.user);
    const user = req.user.username;
    const html = `
      <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Already Login</title>
          </head>
          <body>
            <h1>Already Login</h1>
            <p>Hello ${user}!!</p>
            <button type='button' onclick="location.href='/logout'">Logout</button>
          </body>
        </html>
    `;
    res.send(html);
  }
});

app.get("/db", (req, res, next) => {
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

// passport Login : strategy for local authentication
// Authenticate Requests
app.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/" }),
  (req, res) => {
    // alert login sucess and after push button go to main page
    const html = `
      <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" /> 
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Login Success</title>
          </head>
          <body>
            <h1>Login Success</h1>
            <p>Hello ${req.user.username}!!</p>
            <button type='button' onclick="location.href='/'">Go to main page</button>
          </body>
        </html>
    `;
    res.send(html);
  }
);

app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.log(err);
    }
    res.redirect("/");
  });
});

// 404 error handlers

app.use((req, res, next) => {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handling middlewares
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.send("error");
});

// server link to port 8080
app.listen(app.get("port"), () => {
  console.log(`Server is running on port ${app.get("port")}`);
});
