const { compile } = require('handlebars');
const mjml2html = require('mjml');
const fs = require('fs');
const path = require('path');
const { senderData } = require('../constants/email');

const listAllUsers = async function(nextPageToken, admin) {
    admin
        .auth()
        .listUsers(1000, nextPageToken)
        .then(function(listUsersResult) {
            listUsersResult.users.forEach(function(userRecord) {
                /* eslint-disable-next-line */
                console.log('user', userRecord.toJSON());
            });
            if (listUsersResult.pageToken) {
                listAllUsers(listUsersResult.pageToken, admin);
            }
        });
};

const buildTemplate = function(emailData) {
    let mjmlTemplate = fs.readFileSync(
        `${__dirname}/../templates/base.mjml`,
        'utf8',
    );

    mjmlTemplate = compile(mjmlTemplate);
    mjmlTemplate = mjmlTemplate({ emailType: 'digest' });

    let html = mjml2html(mjmlTemplate, {
        filePath: path.join(__dirname, '/../templates/components'),
        minify: true,
    });

    html = compile(html.html);
    html = html(emailData);

    return html;
};

const buildEmail = function(emailData, html) {
    const msg = {
        to: emailData.email,
        from: {
            name: senderData.name,
            email: senderData.email,
        },
        subject: `${emailData.name}, check out this week's newest hikes.`,
        categories: ['Digest'],
        html,
    };

    return msg;
};

exports.digestEmail = async function(admin, db, sgMail, testData) {
    if (testData) {
        return buildTemplate(testData);
    }

    if (sgMail) {
        const emailData = await listAllUsers(admin);
        const html = buildTemplate(emailData);
        const msg = buildEmail(emailData, html);
        return sgMail.send(msg);
    }

    return false;
};
