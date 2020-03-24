const { compile } = require('handlebars');
const mjml2html = require('mjml');
const fs = require('fs');
const path = require('path');

exports.buildTemplate = function(emailData, emailType) {
    let mjmlTemplate = fs.readFileSync(
        `${__dirname}/../templates/base.mjml`,
        'utf8',
    );

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
