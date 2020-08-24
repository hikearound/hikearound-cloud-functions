const { compile } = require('handlebars');
const mjml2html = require('mjml');
const fs = require('fs');
const path = require('path');
const { unsubscribe } = require('../constants/email');

exports.getUnsubscribe = function (emailData, emailType) {
    return `${unsubscribe.url}/?type=${emailType}&uid=${emailData.uid}`;
};

exports.buildTemplate = function (emailData, emailType) {
    let mjmlTemplate = fs.readFileSync(
        `${__dirname}/../templates/base.mjml`,
        'utf8',
    );

    emailData.globalUnsubscribe = exports.getUnsubscribe(emailData, 'global');
    emailData.typeUnsubscribe = exports.getUnsubscribe(emailData, emailType);

    mjmlTemplate = compile(mjmlTemplate);
    mjmlTemplate = mjmlTemplate({ emailType });

    let html = mjml2html(mjmlTemplate, {
        filePath: path.join(__dirname, '../templates/components'),
        minify: true,
    });

    html = compile(html.html);
    html = html(emailData);

    return html;
};
