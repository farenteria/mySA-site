// require statements
require("dotenv").config();
const express = require("express");
const firebase = require("firebase");
const bodyParser = require("body-parser");
const path = require("path");
const databaseModule = require("./public/js/database.js");
const authModule = require("./public/js/auth.js");
const methodOverride = require("method-override");

// routes
const indexRoutes = require("./routes/index.js");
// const feedsRoutes = require("./routes/feeds.js");

// globabl variables
var newUserInfo;
const PORT = 9000;

// firebase configuration
var config = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    databaseURL: process.env.DATABASE_URL,
    storageBucket: process.env.STORAGE_BUCKET
};

firebase.initializeApp(config);

firebase.auth().onAuthStateChanged((user) => {
    if(user){
        databaseModule.initializeDb();

        if(authModule.checkIfNewUser()){
            databaseModule.insertNewUser(newUserInfo);
        }

        console.log("logged in");

        // check for admin role
        // authModule.checkForAdmin(usersRef);
    }else{
        console.log("not logged in");
    }
});

// Express route configuration
let app = express();

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "/public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// Routes
app.use("/", indexRoutes);
// app.use("/feeds", feedsRoutes);

// Functions
function getFeedAndRender(res){
    // Will redirect user to logout if user isn't admin
    // authModule.checkForAdmin(usersRef, res);
    databaseModule.orderFeed(res);
}

function redirectToGet(res){
    res.redirect("/feeds");
}

// GET ROUTES
// Only admin users should be able to access feeds
app.get("/feeds", authModule.isUserAuthenticated, (req, res) => {
    getFeedAndRender(res);
});

// POST ROUTES
// Actually create a new user
app.post("/new_user", (req, res) => {
    newUserInfo = authModule.createUser(
        req.body.first,
        req.body.last,
        req.body.email,
        req.body.password,
        req.body.confirm
    );

    getFeedAndRender(res);
});

// This will add new entry into the database 
app.post("/feeds", authModule.isUserAuthenticated, (req, res) => {
    databaseModule.addItem(req.body);
    getFeedAndRender(res);
});

// UPDATE ROUTES
// update a feed item
app.put("/feeds/:id", authModule.isUserAuthenticated, (req, res) => {
    databaseModule.updateItem(req.params.id, req.body);
    redirectToGet(res);
});

// DELETE ROUTES
// delete a feed item
app.delete("/feeds/:id", authModule.isUserAuthenticated, (req, res) => {
    databaseModule.deleteItem(req.params.id);
    redirectToGet(res);
});

// initialize server
app.listen(PORT, () => {
    console.log("Server is up on", PORT);
});