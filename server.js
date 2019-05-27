var bodyParser =require("body-parser");
var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var app = express();
var cheerio = require("cheerio");
var Note = require("./models/Note"); 
var Article = require("./models/Article");
var Save = require("./models/Save");
var path = require("path");
var request = require("request");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
// var axios = require("axios");

// Require all models
// var db = require("./models");

var PORT = 3000;

// Initialize Express

// Configure middleware
// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.json());
// Make public a static folder
app.use(express.static("./public"));

// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");


// Connect to the Mongo DB
mongoose.Promise = Promise;
var dbConnect = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
if(process.env.MONGODB_URI) {
mongoose.connect(process.env.MONGODB_URI)
} else {
  mongoose.connect(dbConnect);
}
mongodb://<dbuser>:<dbpassword>@ds151066.mlab.com:51066/heroku_zb5j80fw;
// Connect mongoose to our db
/*mongoose.connect(dbconnect, function(error) {
  // Log any errors connecting with mongoose
  if (error) {
    console.log(error);
  } else {
    console.lo g("Mongoose is connected");
  }
});*/

mongoose.connect("mongodb://localhost/scraper", { useNewUrlParser: true });

// NEW LINES
var db = mongoose.connection;
db.on("error", function(err){
  console.log("Mongoose Error", err);
});
db.once("open", function(){
  console.log("Mongoose is connected");
});

app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname, "public/views/index.html")); 
});

require("./routes/scrape.js")(app);
require("./routes/html.js")(app);

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "public/views/index.html"));
});


// app.listen(PORT, function () {
//   console.log("App listening on PORT " + PORT);
// });

// // END NEW LINES

// // Routes

// // A GET route for scraping the echoJS website
// app.get("/scrape", function(req, res) {
//   // First, we grab the body of the html with axios
//   axios.get("http://www.washingtonpost.com/").then(function(response) {
//     // Then, we load that into cheerio and save it to $ for a shorthand selector
//     var $ = cheerio.load(response.data);

//     // Now, we grab every h2 within an article tag, and do the following:
//     $("div.headline").each(function(i, element) {
//       // Save an empty result object
//       var result = {};

//       // Add the text and href of every link, and save them as properties of the result object
//       result.title = $(this)
//         // .children("a")
//         .text();
//       result.link = $(this)
//         .find("a")
//         .attr("href");

//       // Create a new Article using the `result` object built from scraping
//       db.Article.create(result)
//         .then(function(dbArticle) {
//           // View the added result in the console
//           console.log(dbArticle);
//         })
//         .catch(function(err) {
//           // If an error occurred, log it
//           console.log(err);
//         });
//     });

//     // Send a message to the client
//     res.send("Scrape Complete");
//   });
// });

// // Route for getting all Articles from the db
// app.get("/articles", function(req, res) {
//   // TODO: Finish the route so it grabs all of the articles
//   db.Article.find({}, function(err, found){
//     if (err){
//       console.log(err);
//     }
//     else {
//       res.json(found);
//     }
//   })
// });

// // Route for grabbing a specific Article by id, populate it with it's note
// app.get("/articles/:id", function(req, res) {
//   // TODO
//   // ====
//   // Finish the route so it finds one article using the req.params.id,
//   db.Article.findOne({_id :req.params.id})
  
//   // and run the populate method with "note",
//   .populate("note")
//   // then responds with the article with the note included
//   .then(function(dbArticle) {
//     res.json(dbArticle);
//   })
//   .catch(function(err) {
//     res.json(err);
//   })
// });

// // Route for saving/updating an Article's associated Note
// app.post("/articles/:id/notes", function(req, res) {
//   // TODO
//   // ====
//   // save the new note that gets posted to the Notes collection
//   db.Note.create(req.body)
//   .then(function(dbNote){
    
//   // then find an article from the req.params.id
 
//   // and update it's "note" property with the _id of the new note
//   return db.Article.findOneAndUpdate({_id: req.params.id} ,{note: dbNote._id}, {new:true});
  
// })
// .then(function(dbArticle) {
//   res.json(dbArticle);
// }) 
// .catch(function(err) {   
//    res.json(err);
//  });
// });


// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
