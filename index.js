const functions = require('firebase-functions');
const sentry = require('@sentry/node');
const config = require('./utils/config');

config.initializeApp();

// Notifications
const welcome = require('./notifications/welcome');
const digest = require('./notifications/digest');
const reset = require('./notifications/reset');

// Functions
const map = require('./functions/map');
const search = require('./functions/search');

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

exports.resetNotif = functions.https.onCall((data) => {
    const { userEmail } = data;
    try {
        return reset.send(userEmail);
    } catch (e) {
        sentry.captureException(e);
    }
    return false;
});

exports.generateStaticMap = functions.firestore
    .document('hikes/{hid}')
    .onUpdate(async (change, context) => {
        const { hid } = context.params;
        try {
            return map.generateStaticMap(hid);
        } catch (e) {
            sentry.captureException(e);
        }
        return false;
    });

exports.indexSearchRecords = functions.firestore
    .document('hikes/{hid}')
    .onUpdate(async (change, context) => {
        const { hid } = context.params;
        try {
            return search.indexRecords(hid);
        } catch (e) {
            sentry.captureException(e);
        }
        return false;
    });
