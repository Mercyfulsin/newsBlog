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
                db.Article.findOne({ title: result.title }, (err, reply) => {
                    if (err) throw err;
                    if (!reply) {
                        result.subTitle = $(item).children("h3").text().trim();
                        result.author = $(item).children("div.news-header2").children("div.byline-and-post-date").children("span").text().trim();
                        result.date = $(item).children("div.news-header2").children("div.byline-and-post-date").children("div").text().trim();
                        result.image = $(item).children("div.clearfix").children("img").attr("src");
                        result.content = $(item).children("div.clearfix").children("div.short").children("p").text();
                        result.link = $(item).children("div.below-body").children("div.read-more").children("a").eq(1).attr("href");
                        db.Article.create(result, (err, reply) => {
                            if (err) throw err;
                        });
                    }
                });

            });
            res.send("Scrape Complete");
        });
    });

    app.get("/articles", function (req, res) {
        db.Article.find({})
            .then(function (dbArticle) {
                res.json(dbArticle);
            })
            .catch(function (err) {
                res.json(err);
            });
    });

    app.post("/articles", (req, res) => {
        let id = req.body.id;
        db.Article.deleteOne({ _id: id }).then(reply => {
            res.json(reply);
        });
    });

    app.get("/articles/:id", function (req, res) {
        db.Article.findOne({ _id: req.params.id })
            .populate("comment")
            .then(function (dbArticle) {
                res.json(dbArticle);
            })
            .catch(function (err) {
                res.json(err);
            });
    });

    app.post("/articles/:id", function (req, res) {
        db.Comment.create(req.body)
            .then(function (dbComment) {
                return db.Article.findOneAndUpdate({ _id: req.params.id }, { comment: dbComment._id }, { new: true });
            })
            .then(function (dbArticle) {
                res.json(dbArticle);
            })
            .catch(function (err) {
                res.json(err);
            });
    });
}