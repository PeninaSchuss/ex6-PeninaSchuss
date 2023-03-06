const {response} = require("express");
module.exports = (function() {
    const db = require('../models');
    const Sequelize = require('sequelize');

    /**
     * This function handle a get request /update - returns the updates of the responses
     * @param req - request
     * @param res - response
     * @param next - next function
     * @returns {Promise<void>}
     */
    async function add(req, res, next) {
        if (!req.body.date)
            res.status(404).send("Error: invalid arguments");
        else {
            if (req.body.response) {
                await db.Responses.create({
                    date: req.body.date,
                    userId: req.session.userId,
                    response: req.body.response
                }).then(async response => {
                    await findResOfDate(req, res)
                }).catch(err => {
                        res.status(404).send(err);
                    });
            }
            else
                await findResOfDate(req, res)
        }
    }

    /**
     * This function handle returns the responses of a date
     * @param req - request
     * @param res - response
     * @returns {Promise<void>}
     */
   async function findResOfDate(req, res) {
       await db.Responses.findAll({
           where: {date: req.body.date},
           include: [{
               model: db.User,
               attributes: ['email', 'firstName']
           }]
       }).then(responses => {
               res.json({responses: responses, user: req.session.email,date: req.body.date})
           })
           .catch(err => {
               res.status(404).send("Error: " + err);
           });
   }

    /**
     * This function handle a get request /deleteRes - returns the updates of the responses of the date of the deleted response
     * @param req - request
     * @param res - response
     * @param next - next function
     * @returns {Promise<void>}
     */
    async function deleteRes(req, res, next) {
        if(!req.body.delId)
            res.status(404).send('Not valid arguments');
        else{
            await db.Responses.destroy({where: {id: req.body.delId, userId: req.session.userId}}).then(async response => {
                if (response === 0)
                    res.status(404).send("Error: you are not the owner of the response");
                else
                    await findResOfDate(req, res);
            })
        }}

    /**
     * This function handle a get request /logout - returns to the main page (middleware)
     * @param req - request
     * @param res - response
     */
    function logout(req, res) {
        req.session.destroy();
        res.redirect("/")
    }

    /**
     * This function returns the responses of the dates of the updates
     * @param responses  - array of responses
     * @returns {Promise<*[]>}
     */
    async function getResponsesByDate(responses) {
        let newResponses = [];
        if (responses.length === 0)
            return newResponses;
        let dateRes = new Date(responses[0].date);
        for (let i = 0; i < responses.length; i++) {
            let key = responses[i];
            if(i === responses.length-1)
                await addDateRes(key, dateRes, newResponses);
            else if (new Date(key.date).getDate()!== dateRes.getDate()) {
                await addDateRes(key, dateRes, newResponses);
                dateRes = new Date(key.date);
            }
        }
        return newResponses;
    }

    /**
     * This function returns the responses of a date of the updates
     * @param key - response
     * @param dateRes - date of the response
     * @param newResponses - array of responses
     * @returns {Promise<*>}
     */
    async function addDateRes(key, dateRes, newResponses) {
        try {
            let resp = await db.Responses.findAll({
                where: { date: dateRes },
                include: [{
                    model: db.User,
                    attributes: ['email', 'firstName']
                }]
            });
            for (let i = 0; i < resp.length; i++)
                newResponses.push(resp[i]);
        }
        catch (err) {
            console.log(err);
        }
        return newResponses;
    }

    /**
     * This function handle a get request /update - returns the updates that happened after the time
     * @param req - request
     * @param res - response
     * @param next - next function
     * @returns {Promise<void>}
     */
    async function update(req, res, next) {
        if((new Date(req.params.endDate) < new Date(req.params.begDate)))
            res.status(404).send('Not valid arguments');
        else{
            let newBeginDate = new Date(req.params.begDate);
            newBeginDate.setDate(newBeginDate.getDate() - 1);
            await db.Responses.findAll({
                where: {date: {[Sequelize.Op.between]: [newBeginDate, req.params.endDate]}
                    ,updatedAt: {[Sequelize.Op.gt]: req.params.time}}
                    ,paranoid: false,
                include: [{
                    model: db.User,
                    attributes: ['email','firstName']
                }]}).then(responses=>getAllResponses(req,res,responses)).catch(err => {
                    res.status(404).send("Error: " + err);
                });
        }
    }

    /**
     * This function returns to client the sorted responses for a update.
     * @param req
     * @param res
     * @param responses
     * @returns {Promise<void>}
     */
    async function getAllResponses(req,res,responses) {
        responses.sort(function (a, b) {
            return new Date(a.date) - new Date(b.date);
        })
        let r = await getResponsesByDate(responses);
        res.json({responses: r, user: req.session.email});
    }

    /**
     * This function check if the user is logged in
     * @param req - request
     * @param res - response
     * @param next - next function
     */
    function checkIfLoggedIn(req, res, next) {
        if (!req.session.email)
            res.json({session: 0})
        else
            next()
    }
    return {
        add: add,
        deleteRes: deleteRes,
        logout: logout,
        update: update,
        checkIfLoggedIn:checkIfLoggedIn
    };
})();

