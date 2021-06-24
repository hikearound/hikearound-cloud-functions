const sentry = require('@sentry/node');
const { initializeMailgun } = require('@utils/config');
const notifications = require('@utils/notifications');
const { buildEmail } = require('@utils/email');
const { domain } = require('@constants/email');

exports.maybeSendEmail = function (user, userData, type, email) {
    const mg = initializeMailgun();

    const emailPreference = userData.notifs.email;
    const emailEnabled = emailPreference.global.enabled;

    let emailTypeEnabled = true;

    if (emailPreference[type] !== undefined) {
        if (!emailPreference[type].enabled) {
            emailTypeEnabled = false;
        }
    }

    if (user.emailVerified && emailEnabled && emailTypeEnabled) {
        mg.messages.create(domain.default, email).catch((e) => {
            sentry.captureException(e);
        });
    }

    return false;
};

exports.maybeSendPushNotif = async function (user, userData, type, data) {
    const pushPreference = userData.notifs.push;
    const pushEnabled = pushPreference.global.enabled;

    let pushTypeEnabled = true;

    if (pushPreference[type] !== undefined) {
        if (!pushPreference[type].enabled) {
            pushTypeEnabled = false;
        }
    }

    if (pushEnabled && pushTypeEnabled) {
        await notifications.send(data, userData);
    }

    return false;
};

exports.sendEmail = async function (data, type) {
    const email = buildEmail(data, type);
    const mg = initializeMailgun();

    mg.messages.create(domain.default, email).catch((e) => {
        sentry.captureException(e);
    });
};
