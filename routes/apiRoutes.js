// apiRoutes
const db = require("../models");
const axios = require("axios");
const cheerio = require("cheerio");
module.exports = app => {
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
                result.link = $(item).children("div.below-body").children("div.read-more").children("a").eq(1).attr("href");
                db.Article.create(result, (err, reply) => {
                    if (err) throw err;
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

    // Route for grabbing a specific Article by id, populate it with it's comment
    app.get("/articles/:id", function (req, res) {
        // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
        db.Article.findOne({ _id: req.params.id })
            // ..and populate all of the comments associated with it
            .populate("comment")
            .then(function (dbArticle) {
                // If we were able to successfully find an Article with the given id, send it back to the client
                res.json(dbArticle);
            })
            .catch(function (err) {
                // If an error occurred, send it to the client
                res.json(err);
            });
    });

    // Route for saving/updating an Article's associated comment
    app.post("/articles/:id", function (req, res) {
        // Create a new comment and pass the req.body to the entry
        db.Comment.create(req.body)
            .then(function (dbComment) {
                // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
                // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
                // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
                return db.Article.findOneAndUpdate({ _id: req.params.id }, { comment: dbComment._id }, { new: true });
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
}