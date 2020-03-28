const sgMail = require('@sendgrid/mail');
const notifications = require('./notifications');
const { getUserData } = require('./user');

exports.maybeSendEmail = async function(user, emailType, email) {
    const userData = await getUserData(user.uid);
    const { enabled } = userData.notifs.email;

    if (user.emailVerified && enabled && emailType) {
        sgMail.send(email);
    }

    return false;
};

exports.maybeSendPushNotif = async function(user, notifType, notif) {
    const userData = await getUserData(user.uid);
    const { enabled } = userData.notifs.push;

    if (enabled && notifType) {
        notifications.send(notif);
    }

    return false;
};
