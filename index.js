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
const user = require('./functions/user');

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

exports.indexHikeRecord = functions.firestore
    .document('hikes/{hid}')
    .onUpdate(async (change, context) => {
        const { hid } = context.params;
        try {
            return search.indexHikeRecord(hid);
        } catch (e) {
            sentry.captureException(e);
        }
        return false;
    });

exports.deleteHikeRecord = functions.firestore
    .document('hikes/{hid}')
    .onDelete(async (change, context) => {
        const { hid } = context.params;
        try {
            return search.deleteHikeRecord(hid);
        } catch (e) {
            sentry.captureException(e);
        }
        return false;
    });

exports.indexUserRecord = functions.firestore
    .document('users/{uid}')
    .onUpdate(async (change, context) => {
        const { uid } = context.params;
        try {
            return search.indexUserRecord(uid);
        } catch (e) {
            sentry.captureException(e);
        }
        return false;
    });

exports.deleteUserRecord = functions.firestore
    .document('users/{uid}')
    .onDelete(async (change, context) => {
        const { uid } = context.params;
        try {
            return search.deleteUserRecord(uid);
        } catch (e) {
            sentry.captureException(e);
        }
        return false;
    });

exports.updatePassword = functions.https.onCall((data) => {
    const { uid, password } = data;
    try {
        return user.updatePassword(uid, password);
    } catch (e) {
        sentry.captureException(e);
    }
    return false;
});
