require("dotenv").config();
const express = require("express");
const exphbs = require("express-handlebars");
const logger = require("morgan");
const mongoose = require("mongoose");
const axios = require("axios");
const cheerio = require("cheerio");
const db = require("./models");
const PORT = process.env.PORT || 8888;
const app = express();
app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });

// Routes
app.get("/", (req, res) => {
    db.Article.find({})
    .then(function (dbArticle) {
        // If we were able to successfully find Articles, send them back to the client
        console.log(JSON.stringify(dbArticle));
        res.render("index", { article: dbArticle });
    })
    .catch(function (err) {
        // If an error occurred, send it to the client
        console.log(err);
        res.json(err);
    });
});

app.get("/scrape", (req, res) => {
    axios.get("https://www.crunchyroll.com/news").then((response) => {
        const $ = cheerio.load(response.data);
        $("ul li.news-item").each((i, item) => {
            let result = {};
            result.title = $(item).children("h2").text().trim();
            result.subTitle = $(item).children("h3").text().trim();
            result.author = $(item).children("div.news-header2").children("div.byline-and-post-date").children("span").text().trim();
            result.date = $(item).children("div.news-header2").children("div.byline-and-post-date").children("div").text().trim();
            result.image = $(item).children("div.clearfix").children("img").attr("src");
            result.content = $(item).children("div.clearfix").children("div.short").children("p").text();
            db.Article.create(result, (err, reply) => {
                if (err) throw err;
                console.log(reply);
            });
        });
        res.send("Scrape Complete");
    });
});

// Route for getting all Articles from the db
app.get("/articles", function (req, res) {
    // Grab every document in the Articles collection
    db.Article.find({})
        .then(function (dbArticle) {
            // If we were able to successfully find Articles, send them back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

app.post("/articles", (req, res) => {
    let id = req.body.id;
    db.Article.deleteOne({ _id: id }).then(reply => {
        res.json(reply);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function (req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article.findOne({ _id: req.params.id })
        // ..and populate all of the notes associated with it
        .populate("note")
        .then(function (dbArticle) {
            // If we were able to successfully find an Article with the given id, send it back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function (req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)
        .then(function (dbNote) {
            // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
            // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
            // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
        })
        .then(function (dbArticle) {
            // If we were able to successfully update an Article, send it back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// Start the server
app.listen(PORT, function () {
    console.log("App running on port http://localhost:" + PORT + "!");
});