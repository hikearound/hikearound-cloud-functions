const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');
const moment = require('moment');
const notifications = require('../utils/notifications');
const { senderData } = require('../constants/email');
const { buildTemplate } = require('../utils/email');

const db = admin.firestore();
const storage = admin.storage();
const auth = admin.auth();

const userList = [];

const tokenIterator = 1000;
const emailType = 'digest';

const buildUserList = async function(nextPageToken) {
    await auth
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

const checkForNewHikes = async function() {
    const now = moment();
    const newHikes = [];

    const hikeRef = await db
        .collection('hikes')
        .orderBy('timestamp', 'desc')
        .limit(5);

    const querySnapshot = await hikeRef.get();

    querySnapshot.forEach((hike) => {
        if (hike.exists) {
            const hikeData = hike.data() || {};
            const dateCreated = moment(hikeData.timestamp.toDate());
            const daysOld = now.diff(dateCreated, 'days');

            if (daysOld <= 7) {
                newHikes.push(hike.id);
            }
        }
    });

    return newHikes;
};

const getMapUrl = async function(hid) {
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

const getEmailData = async function(user, hid) {
    const hikeSnapshot = await db
        .collection('hikes')
        .doc(hid)
        .get();

    const hike = hikeSnapshot.data();
    const hikeMapUrl = await getMapUrl(hid);
    const description = parseDescription(hike.description);
    const upsell = `Get ready for the weekend by checking out ${hike.name} and other hikes we think you might like.`;

    const data = {
        hid,
        hikeMapUrl,
        upsell,
        name: user.displayName,
        email: user.email,
        hikeName: hike.name,
        hikeCity: hike.city,
        hikeDistance: hike.distance,
        hikeElevation: hike.elevation,
        hikeRoute: hike.route,
        hikeDescription: description,
    };

    return data;
};

const buildEmail = function(data, html) {
    const msg = {
        to: data.email,
        from: {
            name: senderData.name,
            email: senderData.email,
        },
        subject: data.upsell,
        categories: [emailType],
        html,
    };

    return msg;
};

const sendNotification = function(uid, data) {
    const notificationData = {
        uid,
        hid: data.hid,
        title: 'Check out this weeks best hikes',
        body: data.upsell,
    };
    notifications.send(notificationData);
};

exports.digestEmail = async function() {
    await buildUserList();
    const newHikes = await checkForNewHikes();

    if (newHikes.length > 0) {
        const hid = newHikes[0];

        await userList.forEach(async function(user) {
            const data = await getEmailData(user, hid);
            const html = buildTemplate(data, emailType);
            const msg = buildEmail(data, html);

            sgMail.send(msg);
            sendNotification(user.uid, data);
        });
    }

    return true;
};
