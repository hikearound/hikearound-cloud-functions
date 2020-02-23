const { compile } = require('handlebars');
const mjml2html = require('mjml');
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const { senderData } = require('../constants/email');

const userList = [];
const hid = 'zvXj5WRBdxrlRTLm65SD';

const buildUserList = async function(nextPageToken) {
    await admin
        .auth()
        .listUsers(1000, nextPageToken)
        .then(function(listUsersResult) {
            listUsersResult.users.forEach((user) => {
                const userData = user.toJSON();
                userList.push(userData);
            });
            if (listUsersResult.pageToken) {
                buildUserList(listUsersResult.pageToken);
            }
        });
};

const getMapUrl = async function(storage) {
    const mapUrl = await storage
        .bucket()
        .file(`images/maps/${hid}.png`)
        .getSignedUrl({
            action: 'read',
            expires: '01-01-2050',
        });

    return mapUrl[0];
};

const getEmailData = async function(storage, db, user) {
    const hikeSnapshot = await db
        .collection('hikes')
        .doc(hid)
        .get();

    const hike = hikeSnapshot.data();
    const hikeMapUrl = await getMapUrl(storage);

    const emailData = {
        hid,
        hikeMapUrl,
        name: user.displayName,
        email: user.email,
        hikeName: hike.name,
        hikeCity: hike.city,
        hikeDistance: hike.distance,
        hikeElevation: hike.elevation,
        hikeRoute: hike.route,
        hikeDescription: hike.description,
    };

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
        await userList.forEach(async function(user) {
            const emailData = await getEmailData(storage, db, user);
            const html = buildTemplate(emailData);
            const msg = buildEmail(emailData, html);
            sgMail.send(msg);
        });
        return true;
    }

    return false;
};
