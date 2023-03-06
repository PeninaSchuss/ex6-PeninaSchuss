const express = require('express');
const router = express.Router();
const loginController = require('../controller/loginController');

/**
 * This function is a middleware that check if the user is logged in
 */
router.use('/', loginController.checkIfLoggedIn);
/**
 * This function handle a get request / - returns the login page
 */
router.post('/registerPassword', loginController.registerPassword);
/**
 * This function handle a get request / - returns the login page
 */
router.get('/', function (req, res) {
    res.render('login');
});
/**
 * This function handle a get request / - returns the login page
 */
router.get('/login', function (req, res) {
    res.render('login',{msg: ''});
});
/**
 * This function handle a get request / - returns the website page
 */
router.post('/signIn', loginController.signIn);
/**
 * This function handle a get request (for refreshing) / - returns to the middle ware and then to a next() according to the condition of the user - logged in or not
 */
router.get('/signIn', function (req, res) {
    res.redirect('/')
});
/**
 * This function handle a get request / - returns the password page
 */
router.post('/checkIfValid', loginController.checkIfValid);
/**
 * This function handle a get request / - returns the register page
 */
router.get('/register', loginController.register);
/**
 * This function handle a get request / - for refreshing - returns the login page
 */
router.get('/checkIfValid', function (req, res) {
    res.render('login');
})
/**
 * This function handle a get request / - for refreshing, returns the login page
 */
router.get('/registerPassword', function (req, res) {
    res.render('login');
})
/**
 * This function handle a get request / - for refreshing, returns the error page
 */
router.get('/error', function (req, res) {
    res.render('error');
})
/**
 * This function handle a get request / - for refreshing ,returns the login page
 */
router.get('/password', function (req, res) {
    res.render('login');
})
module.exports = router;

