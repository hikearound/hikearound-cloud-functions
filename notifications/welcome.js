const admin = require('firebase-admin');
const { encode } = require('js-base64');
const { getUserData } = require('@utils/user');
const { getFirstName } = require('@utils/helper');
const { translate } = require('@utils/i18n');
const { dataFormat } = require('@constants/notif');
const { sendEmail } = require('@utils/send');
const { sendUserHook } = require('@utils/slack');

const type = 'welcome';
const auth = admin.auth();

const buildData = async function (uid) {
    const user = await auth.getUser(uid);
    const userData = await getUserData(uid);

    const data = dataFormat;
    const t = translate(userData);
    const token = encode(uid);

    data.email.toAddress = user.email;
    data.email.subject = t('email.welcome.subject', {
        name: getFirstName(user.displayName),
    });

    data.email.cta.path = `verify?token=${token}`;
    data.email.cta.text = t('email.welcome.cta');
    data.email.body = t('email.welcome.body', {
        name: getFirstName(user.displayName),
    });

    data.t = t;
    data.token = token;
    data.uid = uid;
    data.email.type = type;
    data.includeTypeUnsubscribe = false;

    await sendUserHook({
        uid,
        name: user.displayName,
        email: user.email,
    });

    return data;
};

exports.send = async function (uid) {
    const data = await buildData(uid);
    await sendEmail(data, type);
};
