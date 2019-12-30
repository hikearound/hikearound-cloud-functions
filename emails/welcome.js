const { compile } = require('handlebars');
const mjml2html = require('mjml');
const fs = require('fs');
const path = require('path');

exports.handler = function(senderData, user, sgMail) {
    const mjmlTemplate = fs.readFileSync(
        `${__dirname}/../templates/base.mjml`,
        'utf8',
    );

    const compiledTemplate = mjml2html(mjmlTemplate, {
        filePath: path.join(__dirname, '/../templates/components'),
    });

    const context = {
        name: user.name,
        token: user.token,
    };

    const htmlTemplate = compile(compiledTemplate.html);
    const html = htmlTemplate(context);

    const msg = {
        to: user.email,
        from: {
            name: senderData.name,
            email: senderData.email,
        },
        subject: `${user.name}, welcome to Hikearound!`,
        html,
    };

    return sgMail.send(msg);
};
