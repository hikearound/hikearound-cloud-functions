const admin = require('firebase-admin');
const { encode } = require('js-base64');
const { initializeMailgun } = require('../utils/config');
const { buildEmail } = require('../utils/email');
const { getUserData } = require('../utils/user');
const { getFirstName } = require('../utils/helper');
const { translate } = require('../utils/i18n');

const type = 'welcome';
const auth = admin.auth();

const buildData = async function (uid) {
    const user = await auth.getUser(uid);
    const userData = await getUserData(uid);
    const t = translate(userData);
    const token = encode(uid);

    const data = {
        emailToAddress: user.email,
        emailSubject: t('email.welcome.subject', {
            name: getFirstName(userData.name),
        }),
        emailCta: t('email.welcome.cta'),
    };

    data.emailBody = t('email.welcome.body', {
        name: getFirstName(userData.name),
    });

    data.t = t;
    data.token = token;
    data.uid = uid;
    data.emailType = type;
    data.includeTypeUnsubscribe = false;

    return data;
};

exports.send = async function (uid) {
    const data = await buildData(uid);
    const email = await buildEmail(data, type);
    const mg = initializeMailgun();
    return mg.messages().send(email);
};
