const admin = require('firebase-admin');
const moment = require('moment');
const { senderData } = require('../constants/email');
const { buildTemplate } = require('../utils/email');
const { maybeSendPushNotif, maybeSendEmail } = require('../utils/send');
const { getHikeData, getRecentHikes, getMapUrl } = require('../utils/hike');

const auth = admin.auth();

const userList = [];
const sentUserList = [];

const tokenIterator = 1000;
const type = 'digest';

const buildUserList = async function (nextPageToken) {
    await auth
        .listUsers(tokenIterator, nextPageToken)
        .then(function (listUsersResult) {
            listUsersResult.users.forEach((user) => {
                const userData = user.toJSON();
                userList.push(userData);
            });
            if (listUsersResult.pageToken) {
                buildUserList(listUsersResult.pageToken);
            }
        });
};

const checkForNewHikes = async function () {
    const now = moment();
    const newHikes = [];
    const recentHikes = await getRecentHikes();

    recentHikes.forEach((hike) => {
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

const parseDescription = function (description) {
    if (description.includes('\\n')) {
        return description.replace(/\\n/g, '\n');
    }

    return description;
};

const buildData = async function (user, hid) {
    const hike = await getHikeData(hid);
    const hikeMapUrl = await getMapUrl(hid);
    const description = parseDescription(hike.description);

    const title = 'Check out this weeks best hikes';
    const upsell = `Get ready for the weekend by checking out ${hike.name} and other hikes we think you might like.`;

    const data = { hid, hikeMapUrl };

    // Notification data
    data.notifBody = upsell;
    data.notifTitle = title;

    // Email data
    data.emailSubject = upsell;
    data.emailToAddress = user.email;

    // User data
    data.name = user.displayName;

    // Hike data
    data.hikeName = hike.name;
    data.hikeCity = hike.city;
    data.hikeDistance = hike.distance;
    data.hikeElevation = hike.elevation;
    data.hikeRoute = hike.route;
    data.hikeDescription = description;

    return data;
};

const buildNotif = async function (user, data) {
    return {
        uid: user.uid,
        hid: data.hid,
        title: data.notifTitle,
        body: data.notifBody,
    };
};

const buildEmail = async function (data) {
    const html = buildTemplate(data, type);

    return {
        to: data.emailToAddress,
        from: {
            name: senderData.name,
            email: senderData.email,
        },
        subject: data.emailSubject,
        categories: [type],
        html,
    };
};

const maybeSendDigest = async function (user, hid) {
    const data = await buildData(user, hid);
    const email = await buildEmail(data);
    const notif = await buildNotif(user, data);

    maybeSendEmail(user, type, email);
    maybeSendPushNotif(user, type, notif);

    sentUserList.push(user.uid);
};

exports.send = async function () {
    await buildUserList();
    const newHikes = await checkForNewHikes();

    if (newHikes.length > 0) {
        const hid = newHikes[0];

        userList.forEach(async function (user) {
            if (!sentUserList.includes(user.uid)) {
                await maybeSendDigest(user, hid);
            }
        });
    }

    return true;
};
