const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');
const { encode } = require('js-base64');
const { buildEmail } = require('../utils/email');
const { getUserData } = require('../utils/user');
const { getFirstName } = require('../utils/helper');

const type = 'welcome';
const auth = admin.auth();

const buildData = async function (uid) {
    const user = await auth.getUser(uid);
    const userData = await getUserData(uid);

    const data = {
        name: getFirstName(userData.name),
        token: encode(uid),
        emailToAddress: user.email,
        emailSubject: `${getFirstName(userData.name)}, welcome to Hikearound!`,
    };

    data.uid = uid;
    data.includeTypeUnsubscribe = false;

    return data;
};

exports.send = async function (uid) {
    const data = await buildData(uid);
    const email = await buildEmail(data, type);

    return sgMail.send(email);
};
