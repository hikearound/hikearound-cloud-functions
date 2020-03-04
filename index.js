const functions = require('firebase-functions');
const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');
const sentry = require('@sentry/node');
const serviceAccount = require('./service-account.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'hikearound-14dad.appspot.com',
});

sgMail.setApiKey(functions.config().sendgrid.key);

sentry.init({
    dsn: 'https://9fb810b337f7498ab70662518aeddae2@sentry.io/1877771',
});

// Emails
const welcome = require('./emails/welcome');
const digest = require('./emails/digest');

// Functions
const map = require('./functions/map');
const verify = require('./functions/verify');

exports.welcomeEmail = functions.firestore
    .document('users/{uid}')
    .onCreate(async (change, context) => {
        const { uid } = context.params;
        try {
            return welcome.welcomeEmail(uid);
        } catch (e) {
            sentry.captureException(e);
        }
        return false;
    });

exports.generateStaticMap = functions.firestore
    .document('hikes/{hid}')
    .onWrite(async (change, context) => {
        const { hid } = context.params;
        try {
            return map.generateStaticMap(hid);
        } catch (e) {
            sentry.captureException(e);
        }
        return false;
    });

exports.digestEmail = functions.pubsub
    .schedule('every friday 09:00')
    .timeZone('America/Los_Angeles')
    .onRun(async () => {
        try {
            return digest.digestEmail();
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
