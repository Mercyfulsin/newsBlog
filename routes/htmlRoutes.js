// htmlRoutes
const db = require("../models");
const axios = require("axios");
const cheerio = require("cheerio");
module.exports = app => {
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
    app.get("/scrapeNews", (req,res) => {
        res.render("scrape");
    });
}