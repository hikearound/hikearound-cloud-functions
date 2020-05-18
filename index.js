const functions = require('firebase-functions');
const sentry = require('@sentry/node');
const config = require('./utils/config');

config.initializeApp();

// Notifications
const welcome = require('./notifications/welcome');
const digest = require('./notifications/digest');

// Functions
const map = require('./functions/map');
const verify = require('./functions/verify');

exports.welcomeNotif = functions.firestore
    .document('users/{uid}')
    .onCreate(async (change, context) => {
        const { uid } = context.params;
        try {
            return welcome.send(uid);
        } catch (e) {
            sentry.captureException(e);
        }
        return false;
    });

exports.digestNotif = functions.pubsub
    .schedule('every friday 09:00')
    .timeZone('America/Los_Angeles')
    .onRun(async () => {
        try {
            return digest.send();
        } catch (e) {
            sentry.captureException(e);
        }
        return false;
    });

exports.generateStaticMap = functions.firestore
    .document('hikes/{hid}')
    .onCreate(async (change, context) => {
        const { hid } = context.params;
        try {
            return map.generateStaticMap(hid);
        } catch (e) {
            sentry.captureException(e);
        }
        return false;
    });

exports.verifyEmailAddress = functions.firestore
    .document('auth/{uid}')
    .onCreate(async (change, context) => {
        const { uid } = context.params;
        try {
            return verify.verifyEmailAddress(uid);
        } catch (e) {
            sentry.captureException(e);
        }
        return false;
    });
