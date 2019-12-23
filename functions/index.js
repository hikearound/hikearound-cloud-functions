const functions = require('firebase-functions');
const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');
const welcomeEmail = require('./emails/welcome');

admin.initializeApp();
sgMail.setApiKey(functions.config().sendgrid.key);

exports.welcomeEmail = functions.auth.user().onCreate((user) => {
    welcomeEmail.handler(user, sgMail);
});
