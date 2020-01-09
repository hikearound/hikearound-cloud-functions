const { compile } = require('handlebars');
const mjml2html = require('mjml');
const fs = require('fs');
const path = require('path');

const getUserData = async function(db, uid, admin) {
    const userSnapshot = await db
        .collection('users')
        .doc(uid)
        .get();

    const data = await admin.auth().getUser(uid);
    const extraData = userSnapshot.data();

    const user = {
        name: extraData.name,
        token: extraData.token,
        email: data.email,
    };

    return user;
};

const buildTemplate = function(user) {
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

    const context = {
        name: user.name,
        token: user.token,
    };

    html = compile(html.html);
    html = html(context);

    return html;
};

const buildEmail = function(user, senderData, html) {
    const text = `Hi ${user.name}, welcome to Hikearound!\nVerify your email by visiting the following URL: https://tryhikearound.com/verify?token=${user.token}.`;

    const msg = {
        to: user.email,
        from: {
            name: senderData.name,
            email: senderData.email,
        },
        subject: `${user.name}, welcome to Hikearound!`,
        categories: ['Welcome'],
        html,
        text,
    };

    return msg;
};

exports.welcomeEmail = async function(admin, uid, db, senderData, sgMail) {
    const user = await getUserData(db, uid, admin);
    const html = buildTemplate(user);
    const msg = buildEmail(user, senderData, html);

    if (sgMail) {
        return sgMail.send(msg);
    }

    return false;
};
