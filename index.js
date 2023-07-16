// generate a express server for a social media app backend with user authentication, post management, social interactions, and mysql database integration.

const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
require('dotenv').config();
// use express json
app.use(express.json());

//set view
app.set("view engine", "ejs");

// create mysql connection
const db = mysql.createConnection({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// create mysql connection
db.connect((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Connected to MySQL");
  }
});

//create main route
app.get("/", (req, res) => {
  res.render("index");
});

// create /register get route and send the signup.html file
app.get("/signup", (req, res) => {
  res.render("signup", {Title: "Sign Up"});
});

// create register route
app.post("/signup", (req, res) => {
  const sqlQuery = "SELECT * FROM users WHERE username = ?";
  db.query(sqlQuery, [req.body.username], (err, result) => {
    if (err) {
      res.send({ err: err });
    } {
      const q = "INSERT INTO users (`username`, `email`,`password`) VALUES (?)";

      //hash password
      const salt = bcrypt.genSaltSync(10);
      const pass = bcrypt.hashSync(req.body.password, salt);
      const values = [req.body.username, req.body.email, pass];
      // execute sql query
      db.query(q, [values], (err, result) => {
        if (err) {
          res.send({ err: err });
        } else {
          res.send({ message: "User registered" });
        }
      });
    }
  });
});

//create login route

app.get("/login", (req, res) => {
  res.render("login");
});


app.post("/login", (req, res) => {
  const sqlQuery = "SELECT * FROM users WHERE username = ?";
  db.query(sqlQuery, [req.body.username], (err, result) => {
    if (err) {
      res.send({ err: err });
    }
    if (result.length) {
      bcrypt.compare(
        req.body.password,
        result[0].password,
        (err, compareResult) => {
          if (err) {
            console.log(err);
          }
          if (!compareResult) {
            res.send({ message: "Incorrect password" });
          } else {
            //redirect to respective user page
            res.redirect("/" + result[0].id);
          }
        }
      );
    } else {
      res.send({ message: "Username does not exist" });
    }
  });
});

// create a dynamic user home route which uses the user id to get the user posts from the database

app.get("/:id", (req, res) => {
  const sqlQuery = "SELECT * FROM posts WHERE userid = ?";
  db.query(sqlQuery, [req.params.id], (err, result) => {
    if (err) {
      res.send({ err: err });
    } else {
      //get the username of the user
      const q = "SELECT username FROM users WHERE id = ?";
      db.query(q, [req.params.id], (err, user) => {
        if (err) {
          res.send({ err: err });
        } else {
          res.render("profile", {user: user, posts: result, myid: req.params.id });
        }
      });
    }
  });
});
// craete a post route to add new posts for the respective user

app.post("/addpost", (req, res) => {
  const q = "INSERT INTO posts (`userid`, `desc`) VALUES (?)";
  const values = [req.body.id, req.body.desc];
  db.query(q, [values], (err, result) => {
    if (err) {
      res.send({ err: err });
    } else {
      res.redirect("/" + req.body.id);
    }
  });
});

// create a delete route to delete posts

app.post("/deletepost", (req, res) => {
  const q = "DELETE FROM posts WHERE id = ?";
  db.query(q, [req.body.postid], (err, result) => {
    if (err) {
      res.send({ err: err });
    } else {
      res.redirect("/" + req.body.userid);
    }
  });
});

//create a logout route

app.post("/logout", (req, res) => {
  res.redirect("/");
});


// listen on port 3000
app.listen(3000, () => {
  console.log("Server running on port 3000");
});

