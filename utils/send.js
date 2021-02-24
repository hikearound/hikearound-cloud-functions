const { initializeMailgun } = require('./config');
const notifications = require('./notifications');
const { getUserData } = require('./user');
const { buildEmail } = require('./email');

exports.maybeSendEmail = async function (user, type, email) {
    const mg = initializeMailgun();
    const userData = await getUserData(user.uid);

    const emailPreference = userData.notifs.email;
    const emailEnabled = emailPreference.global.enabled;

    let emailTypeEnabled = true;

    if (emailPreference[type] !== undefined) {
        if (!emailPreference[type].enabled) {
            emailTypeEnabled = false;
        }
    }

    if (user.emailVerified && emailEnabled && emailTypeEnabled) {
        mg.messages().send(email);
    }

    return false;
};

exports.maybeSendPushNotif = async function (user, type, data) {
    const userData = await getUserData(user.uid);

    const pushPreference = userData.notifs.push;
    const pushEnabled = pushPreference.global.enabled;

    let pushTypeEnabled = true;

    if (pushPreference[type] !== undefined) {
        if (!pushPreference[type].enabled) {
            pushTypeEnabled = false;
        }
    }

    if (pushEnabled && pushTypeEnabled) {
        notifications.send(data);
    }

    return false;
};

exports.sendEmail = async function (data, type) {
    const email = await buildEmail(data, type);
    const mg = initializeMailgun();
    return mg.messages().send(email);
};
