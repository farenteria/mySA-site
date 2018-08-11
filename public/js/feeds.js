let openB = document.getElementsByClassName("edit-butt");
let modal = document.getElementsByClassName("modal");
let close = document.getElementsByClassName("close");
let formElements = document.getElementById("edit-item-form");
let newFormElements = document.getElementById("new-item-form");
let invalid = document.getElementsByClassName("invalid");
// date[0] corresponds to new item, date[1] corresponds to update
let dates = document.getElementsByClassName("date");
let postId;

window.onclick = (e) => {
    if(e.target == modal[0]){
        closeModal(modal[0]);
    }else if(e.target == invalid[0]){
        closeModal(invalid[0]);
    }
}

function addCloseListeners(){
    close[0].onclick = () => {
        closeModal(invalid[0]);
    }

    close[1].onclick = () => {
        closeModal(modal[0]);
    }
}

function showModal(title, image, date, score, link, zip, address, id){
    modal[0].style.display = "block";
    // These will just allow viewer to see previous values
    formElements[0].setAttribute("placeholder", title);
    formElements[1].setAttribute("placeholder", image);
    // These will ensure that any unchanged data will be sent in update
    formElements[0].setAttribute("value", title);
    formElements[1].setAttribute("value", image);
    formElements[2].setAttribute("value", date);
    formElements[3].setAttribute("value", score);
    formElements[4].setAttribute("value", link);
    formElements[5].setAttribute("value", zip);
    formElements[6].setAttribute("value", address);

    setId(id);
    setFormAction();
}

function closeModal(element){
    element.style.display = "none";
}

function setId(id){
    postId = id;
}

function getId(){
    console.log(postId);
}

function setFormAction(){
    formElements.action = "/feeds/" + postId + "?_method=PUT";
}

function redirect(){
    console.log("redirecting");
    window.location.href = "/feeds/" + postId + "?_method=PUT";
}

function updateDate(){
    console.log(id);
}

function checkNewItemDate(){
    checkDateValidity(dates[0]);
}

function checkUpdateItemDate(){
    checkDateValidity(dates[1]);
}

function setDefaultDate(){
    newFormElements[2].valueAsDate = new Date();
}

function checkDateValidity(date){
    // UTC Date will account for timezone 
    let todayDay = new Date().getUTCDate();
    let todayMonth = new Date().getUTCMonth();
    let formDay = new Date(date.value).getUTCDate();
    let formMonth = new Date(date.value).getUTCMonth();

    // The only situation in which user should be able to post a date will be when the date of the
    // event hasn't already passed
    if(formMonth < todayMonth){
        showDateError();
    }else if(formMonth === todayMonth && formDay < todayDay){
        showDateError();
    }
}

function showDateError(){
    invalid[0].style.display = "block";
}

function fixQuotes(strings){
    console.log("fix");
}

setDefaultDate();
addCloseListeners();