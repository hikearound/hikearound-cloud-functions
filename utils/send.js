const sgMail = require('@sendgrid/mail');
const admin = require('firebase-admin');
const notifications = require('./notifications');

const db = admin.firestore();

exports.maybeSendEmail = async function(user, emailType, email) {
    const userSnapshot = await db
        .collection('users')
        .doc(user.uid)
        .get();

    const userData = userSnapshot.data();
    const emailEnabled = userData.emailNotifs.enabled;

    if (user.emailVerified && emailEnabled && emailType) {
        sgMail.send(email);
    }

    return false;
};

exports.maybeSendPushNotif = async function(user, notifType, notif) {
    const userSnapshot = await db
        .collection('users')
        .doc(user.uid)
        .get();

    const userData = userSnapshot.data();
    const notifsEnabled = userData.pushNotifs.enabled;

    if (notifsEnabled && notifType) {
        notifications.send(notif);
    }

    return false;
};
