let newBeginningDate
let date;
const apiKey="fqrJka7sSEgTaRSffOUYumxaqJqoctED6un0ADh5";
const oldDate=new Date("Jun 16, 1995");

/**
 * This is a module that contains all the functions that are used to handle the website
 * @type - object
 * */
const websiteHandlers = (function(){
    /**
     * this function hides the last error of a date.
     */
    function middleDateChanged() {
        document.getElementById("errorDate").style.display="none"
    }
    /**
     * This function write response to the html
     * @param data - the data that was sent from the server
     * @param date - the date of the picture
     */
    function writeResponseToHTML(data, date) {
        let dateStr = date.toISOString().split('T')[0];
        document.getElementById("errorMessage").innerHTML ="";
        let html = "";
        data["responses"].forEach(elem => {
            html += `<div class="card" style="background-color: darkgrey"><li><strong>${elem.User.firstName}: </strong>${elem["response"]}  `;
            if (elem.User.email=== data["user"]) {
                html += `<button type="button" style="float: right" class="${dateStr}del btn btn-secondary btn-sm" id="${elem["id"]}">Remove</button></li><br></div>`;
            }
        });
        document.getElementById(`${dateStr}responses`).innerHTML = html;
        responseHandlers.addRemoveListeners(dateStr);
    }
    /**
     * This function handle the change of the date that was chosen by the user
     * @param event - the event that was triggered
     */
    function dateChanged(event) {
        document.getElementById("spinner").style.display="block"
        document.getElementById("moreButton").style.display="none"
        document.getElementById("data").innerHTML=""
        date = new Date(document.getElementById("date").value)
        newBeginningDate = new Date(document.getElementById("date").value)
        NASAHandlers.sendToNasa()
    }
    /**
     * This function is called when the user clicks the login button
     */
    function login(){
        setInterval(responseHandlers.updateResponses,15000)
        document.getElementById("spinner").style.display = "block";
        date = new Date();
        newBeginningDate = new Date()
        NASAHandlers.sendToNasa();
        document.getElementById("date").valueAsDate=new Date();
        document.getElementById("DateDiv").style.display = "block";
    }
    /**
     * This function sends a request to the server to get the pictures from the date that was chosen by the user
     * @param data - the data that was sent from the server
     */
    function addPics(data) {
        document.getElementById("errorMessage").innerHTML ="";
        hideSpinner();
        if ((data.code) !== 200 && data.msg !== undefined) {
            showErrorMessage(data.msg);
            return;
        }
        hideErrorMessage();
        const html = createHtml(data);
        addHtmlToPage(html);
        responseHandlers.requestResponsesFromServer(new Date(oldDate));
        showMoreButton();
        responseHandlers.addResponseListeners();
    }
    /**
     * This function hides the spinner
     */
    function hideSpinner() {
        document.getElementById("spinner").style.display = "none";
    }
    /**
     * This function shows the error message
     * @param message - the error message
     */
    function showErrorMessage(message) {
        const errorElement = document.getElementById("errorDate");
        errorElement.style.display = "block";
        errorElement.innerHTML = message;
    }
    /**
     * This function Hides the error message element
     */
    function hideErrorMessage() {
        document.getElementById("errorDate").style.display = "none";
    }
    /**
     * This function Create the HTML for the pictures
     * @param data - the data from the server
     * @returns {string} - the HTML
     */
    function createHtml(data) {
        let html = "";
        data.reverse().forEach(elem => {
            html += `<div class = "col-4" id="${elem.date}"><div style="text-align: center"><h2>${elem.title}</h2> <h5>${elem.date}</h5><br>`;
            if (elem.media_type === "image") {
                html += `<img class="img-fluid card-img-top"  src="${elem.url}" alt="...">`;
            } else {
                html += `<iframe src="${elem.url}" class="card-img-top" ></iframe>`;
            }
            html += `<p><strong>explanation: </strong>${elem.explanation}</p>`;
            if (elem.copyright !== undefined) {
                html += `<strong>copyright: </strong>${elem.copyright}<br><br>`;
            }
            html += `<input type="text" class="form-control" id="${elem.date}addResponse" placeholder="add response" maxlength="128">`;
            html += `<button type="button" class="res btn btn-primary btn-sm btn-block mb-3" id = "${elem.date}sendResponse" >send</button><br><br></div>`;
            html += `<div ><ul id="${elem.date}responses"></ul></div></div>`;
        });
        return html;
    }
    /**
     * This function Adds the html to the page
     * @param html
     */
    function addHtmlToPage(html) {
        document.getElementById("data").innerHTML += html;
    }
    /**
     * This function show 'more' button
     */
    function showMoreButton() {
        document.getElementById("moreButton").style.display = "block";
    }
return {
    middleDateChanged,
    writeResponseToHTML,
    login,
    addPics,
    dateChanged,
}})();

/**
 * This is a module that handles the requests to the server
 * @type  - an object
 */
const NASAHandlers =(function () {
    /**
     * This function sends a request to the NASA server to get pictures.
     */
    function sendToNasa()
    {
        let end=`${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
        date.setDate(date.getDate()-8);
        let start=`${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
        let theurl = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&start_date=${start}&end_date=${end}&concept_tags=True` // the form ACTION attribute - we can also ignore it and just hardcode the url
        responseHandlers.fetchFromServer(theurl,websiteHandlers.addPics)
    }
    /**
     * This function is called when the user clicks the add more pictures button
     * @param event - the event
     */
    function addMorePics(event)
    {
        document.getElementById("moreButton").style.display="none"
        document.getElementById("spinner").style.display="block"
        NASAHandlers.sendToNasa()
    }
    return {
        sendToNasa,
        addMorePics,

    }
})();


/**
 * This is a module that handles the responses
 * @type - an object
 * */
const responseHandlers =(function () {
    /**
     * This function sends a request to the server to get the responses from the date that was chosen by the user
     * @param newDate - the date that last updated.
     */
    function requestResponsesFromServer(newDate) {
        let theurl = `/index/resUpdate:${newDate}&:${newBeginningDate}&:${date}`
        fetchFromServer(theurl,updateResponsesFromServer,{method: "GET"})
    }

    /**
     * This function sends a request to the server to get the responses that were updated.
     * @param data - the data from the server
     * @returns {Promise<void>} - the promise
     */
    async function updateResponsesFromServer(data) {
        if (data.session === 0 || document.getElementById("userEmail").getAttribute("data")!==data["user"])
            location.href = "/"
        else if (data["responses"].length !== 0) {
            let date = data["responses"][0].date;
            let resArr = []
            for (let i = 0; i < data["responses"].length; i++) {
                if (data["responses"][i].date !== date) {
                    await websiteHandlers.writeResponseToHTML({responses: resArr, user: data["user"]}, new Date(date))
                    resArr = []
                    date = data["responses"][i].date
                }
                resArr.push(data["responses"][i])
            }
            await websiteHandlers.writeResponseToHTML({responses: resArr, user: data["user"]}, new Date(date))
        }
    }

    /**
     * This function sends any fetch request to the server.
     * @param url - the url to send the request to
     * @param func - the function to call when the response is ready
     * @param obj - the object to send to the server
     */
    function fetchFromServer(url,func,obj){
        fetch(`${url}`,obj)
            .then(function (response) {
                return response.json();
            }).then(func).catch(function (error) {
            document.getElementById("errorMessage").innerHTML = "Error: " + error;
            document.documentElement.scrollTop = 0;
        });
    }
    /**
     * This function handles the add response from the server
     * @param event - the event that was triggered
     */
    function handleAddResponse(event) {
        let date = new Date(event.target.id.split('sendResponse')[0]);
        let dateStr = date.toISOString().split('T')[0];
        let response = document.getElementById(dateStr + 'addResponse').value;
        let data = {date: date, response: response};
        let obj = {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data)
        }
        fetchFromServer(`/index/resAdd`,addTheResponses,obj)
    }

    /**
     * This function adds the response to the picture in the date that was chosen by the user
     * @param data - the response from the server
     */
    function addTheResponses(data) {
        if (data.session === 0 || document.getElementById("userEmail").getAttribute("data")!==data["user"])
            location.href = "/"
        else {
            let d = new Date(data["date"]);
            websiteHandlers.writeResponseToHTML(data,d)
            document.getElementById(`${ d.toISOString().split('T')[0]}addResponse`).value = ""
        }
    }
    /**
     * This function removes a response from the picture in the date that was chosen by the user
     * @param event - the event that was triggered
     */
    function removeResponse(event) {
        let date = new Date(event.target.className.split('del')[0]);
        let delId = parseInt(event.target.id);
        let data = {date:date,delId: delId};
        let obj= {
            method: "DELETE",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data)
        }
        fetchFromServer(`/index/resDelete`,addTheResponses,obj)
    }
    /**
     * This function add listeners to the remove buttons
     * @param date - the date of the picture
     */
    function addRemoveListeners(date) {
        const del = document.getElementsByClassName(`${date}del`);
        [...del].forEach(elem => {
            elem.addEventListener("click", removeResponse);
        });
    }

    /**
     * This function is called to update the responses from the server
     */
    function updateResponses() {
        let newDate=new Date();
        newDate.setSeconds(newDate.getSeconds()-15);
        responseHandlers.requestResponsesFromServer(newDate)
    }
    /**
     * This function add listeners to the buttons that send a response to the server
     */
    function addResponseListeners() {
        const ress = document.getElementsByClassName("res");
        [...ress].forEach(elem => {
            elem.addEventListener("click", handleAddResponse);
        });
    }
    return {
        requestResponsesFromServer,
        fetchFromServer,
        addResponseListeners,
        addRemoveListeners,
        updateResponses,
    }
})();
/**
 * This is the main function.
 */
document.addEventListener("DOMContentLoaded", function() {
    websiteHandlers.login()
    document.getElementById("DateDiv").addEventListener("change",websiteHandlers.middleDateChanged);
    document.getElementById("send").addEventListener("click",websiteHandlers.dateChanged);
    document.getElementById("moreButton").addEventListener("click",NASAHandlers.addMorePics);
});
