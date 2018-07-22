const firebase = require("firebase");
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

middlewareObj.orderFeed = (res) => {
    feedRef.orderByChild("date").limitToLast(MAX_ITEMS).once("value", (snapshot) => {
        res.render("feeds", { posts: snapshot });
    });
}

// Function will grab form data from body and use each input as newItem fields to be 
// pushed onto feedsRef of database
middlewareObj.addItem = (body) => {
    let newItem = feedRef.push(); // pushes EMPTY record to database

    // this will actually write out all of the required items to that record
    newItem.set({
        title: body.title,
        date: body.date.toString(),
        score: body.score,
        imgUrl: body.image,
        link: body.link,
        zip: body.zip,
        address: body.address
        // description: body.description
    });

    // add new item to associated zip
    addZipConnection(body.zip, newItem.key);
    
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

// find body.zip in zipRef
// insert newItem.key as a new node to that zip
addZipConnection = (zip, id) => {
    let data = firebase.database().ref(`zip/${zip}/ids`).push();
    data.set(id);
}

module.exports = middlewareObj;