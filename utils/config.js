const admin = require('firebase-admin');
const Mailgun = require('mailgun-js');
const functions = require('firebase-functions');
const sentry = require('@sentry/node');
const serviceAccount = require('../service-account.json');
const { domain } = require('../constants/email');

exports.initializeApp = function () {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: 'hikearound-14dad.appspot.com',
    });

    sentry.init({
        dsn: functions.config().sentry.dsn,
    });
};

exports.initializeMailgun = function () {
    const mg = new Mailgun({
        apiKey: functions.config().mailgun.key,
        domain: domain.default,
    });

    return mg;
};
