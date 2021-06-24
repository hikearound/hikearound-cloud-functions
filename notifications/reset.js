const admin = require('firebase-admin');
const { sendEmail } = require('@utils/send');
const { getUserData } = require('@utils/user');
const { getFirstName } = require('@utils/helper');
const { translate } = require('@utils/i18n');
const { dataFormat } = require('@constants/notif');

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

    const data = dataFormat;
    const t = translate(userData);

    data.email.toAddress = user.email;
    data.email.subject = t('email.reset.subject');

    data.email.cta.path = `reset?token=${token}`;
    data.email.cta.text = t('email.reset.cta');
    data.email.body = t('email.reset.body', {
        name: getFirstName(userData.name),
    });

    data.t = t;
    data.token = token;
    data.uid = user.uid;
    data.email.type = type;
    data.includeTypeUnsubscribe = false;

    return data;
};

exports.send = async function (userEmail) {
    const data = await buildData(userEmail);
    await sendEmail(data, type);
};
