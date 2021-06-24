const admin = require('firebase-admin');
const functions = require('firebase-functions');
const sentry = require('@sentry/node');
const algoliasearch = require('algoliasearch');
const formData = require('form-data');
const Mailgun = require('mailgun.js');
const serviceAccount = require('@keys/service-account.json');

exports.initializeApp = function () {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: 'hikearound-14dad.appspot.com',
    });

    sentry.init({
        dsn: functions.config().sentry.dsn,
    });
};

exports.initializeAlgolia = function () {
    const appId = functions.config().algolia.id;
    const adminKey = functions.config().algolia.admin_key;

    return algoliasearch(appId, adminKey);
};

exports.initializeMailgun = function () {
    const mailgun = new Mailgun(formData);

    const mg = mailgun.client({
        username: 'api',
        key: functions.config().mailgun.key,
    });

    return mg;
};
