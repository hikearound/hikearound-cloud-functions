const { compile } = require('handlebars');
const mjml2html = require('mjml');
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const { senderData } = require('../constants/email');

const getUserData = async function(db, uid) {
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

const buildTemplate = function(emailData) {
    let mjmlTemplate = fs.readFileSync(
        `${__dirname}/../templates/base.mjml`,
        'utf8',
    );

    mjmlTemplate = compile(mjmlTemplate);
    mjmlTemplate = mjmlTemplate({ emailType: 'welcome' });

    let html = mjml2html(mjmlTemplate, {
        filePath: path.join(__dirname, '/../templates/components'),
        minify: true,
    });

    html = compile(html.html);
    html = html(emailData);

    return html;
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
        categories: ['Welcome'],
        html,
        text,
    };

    return msg;
};

exports.welcomeEmail = async function(uid, db, sgMail, testData) {
    if (testData) {
        return buildTemplate(testData);
    }

    if (sgMail) {
        const emailData = await getUserData(db, uid);
        const html = buildTemplate(emailData);
        const msg = buildEmail(emailData, html);
        return sgMail.send(msg);
    }

    return false;
};
