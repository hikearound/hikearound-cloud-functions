const { compile } = require('handlebars');
const mjml2html = require('mjml');
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const { senderData } = require('../constants/email');

const userList = [];
const hid = 'zvXj5WRBdxrlRTLm65SD';

const buildUserList = function(nextPageToken) {
    admin
        .auth()
        .listUsers(1000, nextPageToken)
        .then(function(listUsersResult) {
            listUsersResult.users.forEach(function(userRecord) {
                /* eslint-disable-next-line */
                console.log('user', userRecord.toJSON());
                userList.push(userRecord.toJSON());
            });
            if (listUsersResult.pageToken) {
                buildUserList(listUsersResult.pageToken);
            }
        });

    return userList;
};

const getMapUrl = async function(storage) {
    const mapUrl = await storage
        .bucket()
        .file(`images/maps/${hid}.png`)
        .getSignedUrl({
            action: 'read',
            expires: '01-01-2050',
        });

    return mapUrl;
};

const getHikeData = async function(storage, db) {
    const hikeSnapshot = await db
        .collection('hikes')
        .doc(hid)
        .get();

    const emailData = hikeSnapshot.data();
    const mapUrl = await getMapUrl(storage);
    emailData.mapUrl = mapUrl;

    return emailData;
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

exports.digestEmail = async function(storage, db, sgMail, testData) {
    if (testData) {
        return buildTemplate(testData);
    }

    if (sgMail) {
        await buildUserList();
        const emailData = await getHikeData(storage, db);
        const html = buildTemplate(emailData);
        const msg = buildEmail(emailData, html);
        return sgMail.send(msg);
    }

    return false;
};
