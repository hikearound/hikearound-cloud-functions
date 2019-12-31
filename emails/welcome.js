const { compile } = require('handlebars');
const mjml2html = require('mjml');
const fs = require('fs');
const path = require('path');

exports.handler = function(senderData, user, sgMail) {
    let mjmlTemplate = fs.readFileSync(
        `${__dirname}/../templates/base.mjml`,
        'utf8',
    );

    mjmlTemplate = compile(mjmlTemplate);
    mjmlTemplate = mjmlTemplate({ emailType: 'welcome' });

    let html = mjml2html(mjmlTemplate, {
        filePath: path.join(__dirname, '/../templates/components'),
    });

    const context = {
        name: user.name,
        token: user.token,
    };

    html = compile(html.html);
    html = html(context);

    const msg = {
        to: user.email,
        from: {
            name: senderData.name,
            email: senderData.email,
        },
        subject: `${user.name}, welcome to Hikearound!`,
        html,
    };

    if (sgMail) {
        return sgMail.send(msg);
    }

    return false;
};
