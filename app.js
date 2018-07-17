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
var database;
var feedRef;
var usersRef;
var newUserInfo;
const PORT = 9000;
const MAX_ITEMS = 20;

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
        database = firebase.database();
        feedRef = database.ref("feed");
        usersRef = database.ref("users");

        if(authModule.checkIfNewUser()){
            let newUser = usersRef.push(); // pushes EMPTY record to database
        
            // this will actually write out all of the required items to that record
            newUser.set({
                FirstName: newUserInfo.FirstName,
                LastName: newUserInfo.LastName,
                Email: newUserInfo.Email,
                Password: newUserInfo.Password,
                role: newUserInfo.role
            });

            console.log("Added new user to db");
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
    authModule.checkForAdmin(usersRef, res);

    database = firebase.database();
    feedRef = database.ref("feed");
    
    feedRef.orderByChild("date").limitToLast(MAX_ITEMS).once("value", (snapshot) => {
        console.log(snapshot.id);
        res.render("feeds", { posts: snapshot });
    });
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
    databaseModule.addItem(req.body, feedRef);
    getFeedAndRender(res);
});

// UPDATE ROUTES
// update a feed item
app.put("/feeds/:id", authModule.isUserAuthenticated, (req, res) => {
    databaseModule.updateItem(req.params.id, req.body, feedRef);
    redirectToGet(res);
});

// DELETE ROUTES
// delete a feed item
app.delete("/feeds/:id", authModule.isUserAuthenticated, (req, res) => {
    databaseModule.deleteItem(req.params.id, feedRef);
    redirectToGet(res);
});

// initialize server
app.listen(PORT, () => {
    console.log("Server is up on", PORT);
});