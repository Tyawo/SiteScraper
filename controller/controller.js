var express = require("express");
var router = express.Router();
var path = require("path");

var request = require("request");
var cheerio = require("cheerio");

var Note = require("/models/Note.js");
var Article = require("/models/Article.js");


router.get("/", function (req, res) {
    res.redirect("/articles");
});

router.get("/scrape", function (req, res) {
    request("https://www.washingtonpost.com", function (error, response, html) {
        var $ = cheerio.load(html);
        var titlesArray = [];

        $("div.headline").each(function (i, element) {
            var result = {};

            result.title = $(this)
                // .children("a")
                .text();
            result.link = $(this)
                .find("a")
                .attr("href");

            if (result.title !== "" && result.link !== "") {

                if (titlesArray.indexOf(result.title) == -1) {
                    titlesArray.push(result.title);

                    Article.count({ title: result.title }, function (err, test) {
                        if (test === 0) {
                            var entry = new Article(result);

                            entry.save(function (err, doc) {
                                if (err) {
                                    console.log(err)
                                } else {
                                    console.log(doc);
                                }
                            })
                        }

                    })
                } else {
                    console.log("Article already exists.");
                }
            } else {
                console.log("Not saved to db, missing data");
            }
        });
        res.redirect("/");
    });
});

router.get("/articles", function (req, res) {
    Article.find().sort({ _id: -1 })
        .then(function (err, doc) {
            if (err) {
                console.log(err);
            } else {
                var artcl = { article: doc };
                res.render("index", artcl);
            }
        })
})

router.get("/articles-json", function (req, res) {
    Article.find({}, function (err, doc) {
        if (err) {
            console.log(err);
        } else {
            res.json(doc);
        }
    });
});

router.get("/clearAll", function (req, res) {
    Article.remove({}, function (err, doc) {
        if (err) {
            console.log(err);
        } else {
            console.log("removed all articles");
        }
    });
    res.redirect("/articles-json");
});

router.get("/readArticle/:id", function (req, res) {
    var articleId = req.params.id;
    var hbsObj = {
        article: [],
        body: []
    };
    Article.findOne({ _id: articleId })
        // and run the populate method with "note",
        .populate("note")
        // then responds with the article with the note included
        .then(function (err, doc) {
            if (err) {
                console.log("Error:" + err);
            } else {
                hbsObj.article = doc;
                var link = doc.link;
                request(link, function (error, response, html) {
                    var $ = cheerio.load(html);
                    $(".l-col__main").each(function (i, element) {
                        hbsObj.body = $(this)
                            .children("div.blur")
                            .text();

                        res.render("article", hbsObj);
                        return false;
                    })
                });

            }
        })
});
router.post("/note/:id", function (req, res) {
    var user = req.body.name;
    var content = req.boq.note;
    var articleId = req.params.id;

    var notehObj = {
        name: user,
        body: content
    };
    var newNote = new Note(notehObj);

    newNote.save(function (err, doc) {
        if (err) {
            console.log(err);
        } else {
            console.log(doc._id);
            console.log(articleId);

            Article.findOneAndUpdate(
                { _id: req.params.id },
                { $push: { note: doc._id } },
                { new: true }
            ).then(function (err, doc) {
                if (err) {
                    console.log(err);
                } else {
                    res.redirect("/readArticle/" + articleId);
                }
            });
        }
    });
});


module.exports = router;