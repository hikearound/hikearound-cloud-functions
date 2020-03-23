const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');
const { senderData } = require('../constants/email');
const { buildTemplate } = require('../utils/email');

const type = 'welcome';
const db = admin.firestore();
const auth = admin.auth();

const buildData = async function(uid) {
    const userSnapshot = await db
        .collection('users')
        .doc(uid)
        .get();

    const userData = await auth.getUser(uid);
    const extraData = userSnapshot.data();

    const data = {
        name: extraData.name,
        idToken: extraData.idToken,
        email: userData.email,
    };

    data.uid = uid;
    return data;
};

const buildEmail = async function(data) {
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

exports.welcomeEmail = async function(uid) {
    const data = await buildData(uid);
    const email = await buildEmail(data);
    return sgMail.send(email);
};
