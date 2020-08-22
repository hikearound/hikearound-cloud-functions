const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');
const { senderData } = require('../constants/email');
const { buildTemplate } = require('../utils/email');
const { getUserData } = require('../utils/user');
const { getFirstName } = require('../utils/helper');

const type = 'welcome';
const auth = admin.auth();

const buildData = async function (uid) {
    const user = await auth.getUser(uid);
    const userData = await getUserData(uid);

    const data = {
        name: getFirstName(userData.name),
        idToken: userData.idToken,
        email: user.email,
    };

    data.uid = uid;
    return data;
};

const buildEmail = async function (data) {
    const html = buildTemplate(data, type);

    return {
        to: data.email,
        from: {
            name: senderData.name,
            email: senderData.email,
        },
        subject: `${data.name}, welcome to Hikearound!`,
        categories: [type],
        html,
    };
};

exports.send = async function (uid) {
    const data = await buildData(uid);
    const email = await buildEmail(data);
    return sgMail.send(email);
};
