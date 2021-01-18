const admin = require('firebase-admin');
const { initializeMailgun } = require('../utils/config');
const { buildEmail } = require('../utils/email');
const { getUserData } = require('../utils/user');
const { getFirstName } = require('../utils/helper');
const { translate } = require('../utils/i18n');

const type = 'reset';
const auth = admin.auth();

const buildData = async function (userEmail) {
    let user;

    try {
        user = await auth.getUserByEmail(userEmail);
    } catch (e) {
        return false;
    }

    const userData = await getUserData(user.uid);
    const token = await auth.createCustomToken(user.uid);
    const t = translate(userData);

    const data = {
        emailToAddress: user.email,
        emailSubject: t('email.reset.subject'),
        emailCta: t('email.rest.cta'),
    };

    data.emailBody = t('email.reset.body', {
        name: getFirstName(userData.name),
    });

    data.t = t;
    data.token = token;
    data.uid = user.uid;
    data.emailType = type;
    data.includeTypeUnsubscribe = false;

    return data;
};

exports.send = async function (userEmail) {
    const data = await buildData(userEmail);

    if (data) {
        const email = await buildEmail(data, type);
        const mg = initializeMailgun();
        return mg.messages().send(email);
    }

    return true;
};
