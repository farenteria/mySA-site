const firebase = require("firebase");

const authModule = require("./auth.js");

const MAX_ITEMS = 20;

var database;
var feedRef;
var usersRef;

var middlewareObj = {};

middlewareObj.initializeDb = () => {
    database = firebase.database();
    feedRef = database.ref("feed");
    usersRef = database.ref("users");
}

middlewareObj.insertNewUser = (newUserInfo) => {
    firebase.database().ref(`users/${newUserInfo.UniqueID}`).set({
        FirstName: newUserInfo.FirstName,
        LastName: newUserInfo.LastName,
        Email: newUserInfo.Email,
        Password: newUserInfo.Password,
        role: newUserInfo.role,
        UniqueID: newUserInfo.UniqueID
    });

    console.log("Added new user to db", newUserInfo);    
}

middlewareObj.orderFeed = (res) => {
    feedRef.orderByChild("date").limitToLast(MAX_ITEMS).once("value", (snapshot) => {
        res.render("feeds", { posts: snapshot });
    });
}

middlewareObj.isUserAdmin = (email, res, next) => {
    usersRef.once("value").then((userSnapshot) => {
        userSnapshot.forEach((user) => {
            if(user.val().Email.toLowerCase() === email.toLowerCase()){   
                if(user.val().role !== null && user.val().role === "admin"){
                    console.log("Is admin");
                    return next();
                }else{
                    console.log("Isn't admin");
                    return res.redirect("/");
                }
            }   
        });
    });
}

// Function will grab form data from body and use each input as newItem fields to be 
// pushed onto feedsRef of database
middlewareObj.addItem = (body) => {
    // this will actually write out all of the required items to that record
    // description holds an array for some reason
    let currentUser = authModule.getCurrentUser();

    body.counter = 0;
    body.timestamp = new Date();
    
    firebase.database().ref(`feed/${currentUser.uid}`).set({
        title: body.title,
        date: body.date.toString(),
        score: body.score,
        imgUrl: body.image,
        link: body.link,
        zip: body.zip,
        address: body.address,
        counter: body.counter,
        timestamp: body.timestamp.toString()
        // description: body.description
    });

    // add new item to associated zip
    addZipConnection(body);
    console.log("added to db");
}

middlewareObj.deleteItem = (id) => {
    feedRef.child(id).remove();
    console.log("Removed item with id", id);
}

middlewareObj.updateItem = (id, body) => {
    let itemData = {
        title: body.title,
        imgUrl: body.image,
        date: body.date,
        score: body.score,
        link: body.link
    };

    let update = {};

    update[id] = itemData;
    console.log("Updated item with id", id);
    return feedRef.update(update);
}

addZipConnection = (body) => {
    firebase.database().ref(`zip/${body.zip}/${authModule.getCurrentUser().uid}`).set(body);
}

module.exports = middlewareObj;