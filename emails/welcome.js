const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');
const { senderData } = require('../constants/email');
const { buildTemplate } = require('../utils/email');

const emailType = 'welcome';
const db = admin.firestore();

const getUserData = async function(uid) {
    const userSnapshot = await db
        .collection('users')
        .doc(uid)
        .get();

    const data = await admin.auth().getUser(uid);
    const extraData = userSnapshot.data();

    const emailData = {
        name: extraData.name,
        token: extraData.token,
        email: data.email,
    };

    return emailData;
};

const buildEmail = function(emailData, html) {
    const text = `Hi ${emailData.name}, welcome to Hikearound!\nVerify your email by visiting the following URL: https://tryhikearound.com/verify?token=${emailData.token}.`;

    const msg = {
        to: emailData.email,
        from: {
            name: senderData.name,
            email: senderData.email,
        },
        subject: `${emailData.name}, welcome to Hikearound!`,
        categories: [emailType],
        html,
        text,
    };

    return msg;
};

exports.welcomeEmail = async function(uid) {
    const emailData = await getUserData(uid);
    const html = buildTemplate(emailData, emailType);
    const msg = buildEmail(emailData, html);
    return sgMail.send(msg);
};
