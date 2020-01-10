const functions = require('firebase-functions');
const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');
const sentry = require('@sentry/node');
const serviceAccount = require('./service-account.json');
const welcome = require('./emails/welcome');
const map = require('./functions/map');

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

const senderData = {
    name: 'Hikearound',
    email: 'no-reply@tryhikearound.com',
};

exports.welcomeEmail = functions.firestore
    .document('users/{uid}')
    .onCreate(async (change, context) => {
        try {
            return welcome.welcomeEmail(
                admin,
                context.params.uid,
                db,
                senderData,
                sgMail,
            );
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
