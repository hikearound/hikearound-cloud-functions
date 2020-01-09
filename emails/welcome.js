const { compile } = require('handlebars');
const mjml2html = require('mjml');
const fs = require('fs');
const path = require('path');

exports.handler = async function(admin, uid, db, senderData, sgMail) {
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

    const text = `Hi ${context.name}, welcome to Hikearound!\nVerify your email by visiting the following URL: https://tryhikearound.com/verify?token=${context.token}.`;

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

    if (sgMail) {
        return sgMail.send(msg);
    }

    return false;
};
