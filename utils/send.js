const sgMail = require('@sendgrid/mail');
const notifications = require('./notifications');
const { getUserData } = require('./user');

exports.maybeSendEmail = async function (user, type, email) {
    const userData = await getUserData(user.uid);
    const { enabled } = userData.notifs.email;

    if (user.emailVerified && enabled && type) {
        sgMail.send(email);
    }

    return false;
};

exports.maybeSendPushNotif = async function (user, type, notif) {
    const userData = await getUserData(user.uid);
    const { enabled } = userData.notifs.push;

    if (enabled && type) {
        notifications.send(notif);
    }

    return false;
};
