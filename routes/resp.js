const express = require('express');
const router = express.Router();
const nasaController = require('../controller/nasaController');

/**
 * This function handle a get request / - returns the login page
 */
router.get('/logout', nasaController.logout)
/**
 * This function is a middleware that check if the user is logged in
 */
router.use('/', nasaController.checkIfLoggedIn);

/**
 * This function handle a post request /add - add a response and send the array of the responses
 */
router.post('/resAdd', nasaController.add);

/**
 * This function handle a get request /update - returns the updates of the responses
 */
router.get('/resUpdate:time&:endDate&:begDate', nasaController.update);

/**
 * This function handle a delete request /delete - delete a response and send the array of the responses
 */
router.delete('/resDelete', nasaController.deleteRes);

module.exports = router;

