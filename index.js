const functions = require('firebase-functions');
const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');

admin.initializeApp();
sgMail.setApiKey(functions.config().sendgrid.key);

const db = admin.firestore();
const welcomeEmail = require('./emails/welcome');
const map = require('./functions/map');

const senderData = {
    name: 'Hikearound',
    email: 'no-reply@tryhikearound.com',
};

exports.welcomeEmail = functions.firestore
    .document('users/{uid}')
    .onCreate(async (change, context) => {
        const userSnapshot = await db
            .collection('users')
            .doc(context.params.uid)
            .get();

        const data = await admin.auth().getUser(context.params.uid);
        const extraData = userSnapshot.data();

        const user = {
            name: extraData.name,
            token: extraData.token,
            email: data.email,
        };

        return welcomeEmail.handler(senderData, user, sgMail);
    });

exports.generateStaticMap = functions.firestore
    .document('hikes/{hid}')
    .onWrite(async (change, context) => {
        const hikeXmlUrl = await db
            .storage()
            .ref(`hikes/${context.params.hid}.gpx`)
            .getDownloadURL();

        if (hikeXmlUrl) {
            return map.generateStaticMap(hikeXmlUrl);
        }

        return false;
    });
