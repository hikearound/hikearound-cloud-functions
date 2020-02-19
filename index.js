const functions = require('firebase-functions');
const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');
const sentry = require('@sentry/node');
const serviceAccount = require('./service-account.json');
const welcome = require('./emails/welcome');
const map = require('./functions/map');
const digest = require('./emails/digest');

const testData = undefined;

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'hikearound-14dad.appspot.com',
});

sgMail.setApiKey(functions.config().sendgrid.key);

sentry.init({
    dsn: 'https://9fb810b337f7498ab70662518aeddae2@sentry.io/1877771',
});

const db = admin.firestore();
const storage = admin.storage();

exports.welcomeEmail = functions.firestore
    .document('users/{uid}')
    .onCreate(async (change, context) => {
        const { uid } = context.params;
        try {
            return welcome.welcomeEmail(admin, uid, db, sgMail, testData);
        } catch (e) {
            sentry.captureException(e);
        }
        return false;
    });

exports.generateStaticMap = functions.firestore
    .document('hikes/{hid}')
    .onWrite(async (change, context) => {
        try {
            return map.generateStaticMap(storage, context.params.hid, db);
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
            return digest.digestEmail(admin, db, sgMail, testData);
        } catch (e) {
            sentry.captureException(e);
        }
        return false;
    });
