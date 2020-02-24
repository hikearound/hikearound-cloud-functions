const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');
const { senderData } = require('../constants/email');
const { buildTemplate } = require('../utils/email');

const db = admin.firestore();
const storage = admin.storage();

const userList = [];
const tokenIterator = 1000;
const hid = 'zvXj5WRBdxrlRTLm65SD';
const emailType = 'digest';

const buildUserList = async function(nextPageToken) {
    await admin
        .auth()
        .listUsers(tokenIterator, nextPageToken)
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

const getMapUrl = async function() {
    const mapUrl = await storage
        .bucket()
        .file(`images/maps/${hid}.png`)
        .getSignedUrl({
            action: 'read',
            expires: '01-01-2050',
        });

    return mapUrl[0];
};

const parseDescription = function(description) {
    if (description.includes('\\n')) {
        return description.replace(/\\n/g, '\n');
    }
    return description;
};

const getEmailData = async function(user) {
    const hikeSnapshot = await db
        .collection('hikes')
        .doc(hid)
        .get();

    const hike = hikeSnapshot.data();
    const hikeMapUrl = await getMapUrl(storage);
    const description = parseDescription(hike.description);

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
        hikeDescription: description,
    };

    return emailData;
};

const buildEmail = function(emailData, html) {
    const msg = {
        to: emailData.email,
        from: {
            name: senderData.name,
            email: senderData.email,
        },
        subject: `${emailData.name}, check out this week's newest hikes.`,
        categories: [emailType],
        html,
    };

    return msg;
};

exports.digestEmail = async function() {
    await buildUserList();

    await userList.forEach(async function(user) {
        const emailData = await getEmailData(user);
        const html = buildTemplate(emailData, emailType);
        const msg = buildEmail(emailData, html);
        sgMail.send(msg);
    });

    return true;
};
