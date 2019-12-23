const functions = require('firebase-functions');
const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');

const welcomeEmail = require('./emails/welcome');

const senderData = {
    name: 'Hikearound',
    email: 'no-reply@tryhikearound.com',
};

admin.initializeApp();
sgMail.setApiKey(functions.config().sendgrid.key);

exports.welcomeEmail = functions.auth.user().onCreate((user) => {
    return welcomeEmail.handler(senderData, user, sgMail);
});
