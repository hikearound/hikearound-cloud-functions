const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');
const { senderData } = require('../constants/email');
const { buildTemplate } = require('../utils/email');

const type = 'welcome';
const db = admin.firestore();
const auth = admin.auth();

const getUserData = async function(uid) {
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

const buildEmail = function(data, html) {
    const text = `Hi ${data.name}, welcome to Hikearound!\nVerify your email by visiting the following URL: https://tryhikearound.com/verify?uid=${data.uid}&idToken=${data.idToken}.`;

    const email = {
        to: data.email,
        from: {
            name: senderData.name,
            email: senderData.email,
        },
        subject: `${data.name}, welcome to Hikearound!`,
        categories: [type],
        html,
        text,
    };

    return email;
};

exports.welcomeEmail = async function(uid) {
    const data = await getUserData(uid);
    const html = buildTemplate(data, type);
    const email = buildEmail(data, html);
    return sgMail.send(email);
};
