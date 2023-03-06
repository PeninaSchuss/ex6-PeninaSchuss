const {NUMBER} = require("sequelize");
module.exports = (function() {
    let cookies
    const Cookies = require('cookies')
    const db = require('../models');
    const bcrypt = require('bcrypt');

    /**
     * This function is a middleware that checks if the user is logged in
     * @param req - the request
     * @param res  - the response
     * @param next - the next function
     */
    function checkIfLoggedIn(req, res, next) {
        if (req.session.email)
            res.render('board', {user: req.session.firstName,userEmail:req.session.email});
        else
            next()
    }

    /**
     * This function handle a request to register a new user
     * @param req - the request
     * @param res - the response
     */
    function registerPassword(req, res) {
        cookies = new Cookies(req, res)
        let firstN = cookies.get('first_name')
        let lastN = cookies.get('last_name')
        let emailA = cookies.get('email')
        if(!firstN||!lastN||!emailA)
            res.render('register', {firstN:firstN, lastN:lastN, emailA:emailA,error: 'To much time passed. try again to register'});
        else{
            if (req.body.password1 === req.body.password2)
                handleRegister(req, res, firstN, lastN, emailA)
            else
                res.render('password', {error: 'Passwords do not match'});
        }
    }

    /**
     * This function handle a request to register a new user
     * @param req - the request
     * @param res - the response
     * @param firstN - the first name
     * @param lastN  - the last name
     * @param emailA - the email
     */
    function handleRegister(req, res, firstN, lastN, emailA) {
        db.User.findAll({where: {email: emailA}}).then(function (user) {
            if (user.length>0)
                res.render('register', {firstN: firstN, lastN: lastN, emailA: emailA, error: 'Email already exists'});
            else
                addToDataBase(req, res, firstN, lastN, emailA)
        });
    }

    /**
     * This function add the user to the database
     * @param req - the request
     * @param res - the response
     * @param firstN - the first name
     * @param lastN - the last name
     * @param emailA  - the email
     * @returns {Promise<Model<any, TModelAttributes>>}
     */
    function addToDataBase(req, res, firstN, lastN, emailA) {
        let cryptPass = hashIt(req.body.password1)
        let u = db.User.build({ firstName:firstN, lastName:lastN, email:emailA,password:cryptPass});
        return u.save().then((contact) => {
            res.render('login', {msg: "The contact was added successfully!"})
        }).catch((err) => {
                res.render('register', {firstN:firstN, lastN:lastN, emailA:emailA,error: `${err}`});
            })
    }

    /**
     * This function hash the password
     * @param password - the password
     * @returns {*} - the hash
     */
    function hashIt(password) {
        let saltRounds = 10;
        let salt = bcrypt.genSaltSync(saltRounds);
        let hash = bcrypt.hashSync(password, salt);
        return hash;
    }

    /**
     * This function handle a request to sign in
     * @param req - the request
     * @param res - the response
     */
    function signIn(req, res) {
        db.User.findAll({where: {email: req.body.email.toLowerCase()}}).then(function (user) {
            if (user.length>0)
                handelSignIn(req, res, user)
            else
                res.render('login', {msg: 'Wrong email '});
        });
    }

    /**
     * This function handle the request to sign in
     * @param req - the request
     * @param res - the response
     * @param user - the user
     */
    function handelSignIn(req, res, user) {
        if (!(bcrypt.compareSync(req.body.password, user[0].password))) {
            res.render('login', {msg: 'Wrong password'});
        } else {
            req.session.userId = user[0].id;
            req.session.email = user[0].email;
            req.session.firstName = user[0].firstName;
            res.render('board', {user: req.session.firstName,userEmail:req.session.email});
        }
    }

    /**
     * This function handle a request to register a new user
     * @param req - the request
     * @param res - the response
     */
    function checkIfValid(req, res) {
        cookies = new Cookies(req, res)
        db.User.findAll({where: {email: req.body.email.toLowerCase()}
        }).then(function (user) {
            if (user.length>0)
                res.render('register', {firstN: req.body.first_name, lastN: req.body.last_name, emailA: req.body.email.toLowerCase(), error: 'Email already exists'});
            else {
                initSession(req, res)
                res.render('password');
            }
        });
    }

    /**
     * This function init the session
     * @param req - the request
     * @param res - the response
     */
    function initSession(req, res) {
        cookies = new Cookies(req, res)
        cookies.set('first_name', req.body.first_name,  {maxAge:  30*1000 })
        cookies.set('last_name', req.body.last_name,  {maxAge:  30*1000 })
        cookies.set('email', req.body.email.toLowerCase(),  {maxAge:  30*1000 })
    }

    /**
     * This function handles the request to register a new user
     * @param req - the request
     * @param res - the response
     */
    function register(req, res) {
        cookies = new Cookies(req, res)
        let firstN = cookies.get('first_name')
        let lastN = cookies.get('last_name')
        let emailA = cookies.get('email')
        res.render('register', {firstN:firstN, lastN:lastN, emailA:emailA});
    }
    return {
        checkIfLoggedIn: checkIfLoggedIn,
        registerPassword: registerPassword,
        signIn: signIn,
        checkIfValid: checkIfValid,
        register: register,
    };
})();
