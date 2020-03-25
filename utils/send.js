const sgMail = require('@sendgrid/mail');
const notifications = require('./notifications');
const { getUserData } = require('./user');

exports.maybeSendEmail = async function(user, emailType, email) {
    const userData = await getUserData(user.uid);
    const emailEnabled = userData.emailNotifs.enabled;

    if (user.emailVerified && emailEnabled && emailType) {
        sgMail.send(email);
    }

    return false;
};

exports.maybeSendPushNotif = async function(user, notifType, notif) {
    const userData = await getUserData(user.uid);
    const notifsEnabled = userData.pushNotifs.enabled;

    if (notifsEnabled && notifType) {
        notifications.send(notif);
    }

    return false;
};
