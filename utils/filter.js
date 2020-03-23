const sgMail = require('@sendgrid/mail');
const admin = require('firebase-admin');
const notifications = require('./notifications');

const db = admin.firestore();

exports.maybeSendEmail = async function(user, emailType, msg) {
    const userSnapshot = await db
        .collection('users')
        .doc(user.uid)
        .get();

    const userData = userSnapshot.data();
    const emailEnabled = userData.emailNotifs.enabled;

    if (user.emailVerified && emailEnabled && emailType) {
        sgMail.send(msg);
    }

    return false;
};

exports.maybeSendNotif = async function(user, notifType, data) {
    const userSnapshot = await db
        .collection('users')
        .doc(user.uid)
        .get();

    const userData = userSnapshot.data();
    const notifsEnabled = userData.pushNotifs.enabled;

    if (notifsEnabled && notifType) {
        notifications.send(data);
    }

    return false;
};
