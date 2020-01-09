const functions = require('firebase-functions');
const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');

const serviceAccount = require('./service-account.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'hikearound-14dad.appspot.com',
});

sgMail.setApiKey(functions.config().sendgrid.key);

const db = admin.firestore();
const storage = admin.storage();

const welcomeEmail = require('./emails/welcome');
const map = require('./functions/map');

const senderData = {
    name: 'Hikearound',
    email: 'no-reply@tryhikearound.com',
};

exports.welcomeEmail = functions.firestore
    .document('users/{uid}')
    .onCreate(async (change, context) => {
        return welcomeEmail.handler(
            admin,
            context.params.uid,
            db,
            senderData,
            sgMail,
        );
    });

exports.generateStaticMap = functions.firestore
    .document('hikes/{hid}')
    .onWrite(async (change, context) => {
        return map.generateStaticMap(storage, context.params.hid);
    });
