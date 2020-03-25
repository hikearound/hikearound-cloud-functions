const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');
const functions = require('firebase-functions');
const sentry = require('@sentry/node');
const serviceAccount = require('../service-account.json');

exports.initializeApp = function() {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: 'hikearound-14dad.appspot.com',
    });

    sgMail.setApiKey(functions.config().sendgrid.key);

    sentry.init({
        dsn: 'https://9fb810b337f7498ab70662518aeddae2@sentry.io/1877771',
    });
};
