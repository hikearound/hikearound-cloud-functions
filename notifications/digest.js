const { senderData } = require('../constants/email');
const { buildTemplate } = require('../utils/email');
const { maybeSendPushNotif, maybeSendEmail } = require('../utils/send');
const {
    getHikeData,
    getNewHikes,
    getMapUrl,
    getRoute,
} = require('../utils/hike');
const { getUserList, getUserData } = require('../utils/user');
const {
    parseDescription,
    truncateText,
    getFirstName,
} = require('../utils/helper');

const sentUserList = [];
const type = 'digest';

const buildData = async function (user, userData, hid) {
    const hike = await getHikeData(hid);
    const lightMap = await getMapUrl(hid, 'light');
    const darkMap = await getMapUrl(hid, 'dark');
    const description = parseDescription(hike.description);

    const title = 'Check out this weeks best hikes';
    const upsell = `Get ready for the weekend by checking out ${hike.name} and other hikes we think you might like.`;

    const data = { hid, lightMap, darkMap };

    // Notification data
    data.notifBody = upsell;
    data.notifTitle = title;

    // Email data
    data.emailSubject = upsell;
    data.emailToAddress = user.email;

    // User data
    data.name = getFirstName(userData.name);
    data.location = userData.lastKnownLocation.location;

    // Hike data
    data.hikeName = hike.name;
    data.hikeCity = hike.city;
    data.hikeDistance = hike.distance;
    data.hikeElevation = hike.elevation;
    data.hikeRoute = getRoute(hike.route);
    data.hikeDescription = truncateText(description, 350);

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

const maybeSendDigest = async function (user, userData, hid) {
    const data = await buildData(user, userData, hid);
    const email = await buildEmail(data);
    const notif = await buildNotif(user, data);

    maybeSendEmail(user, type, email);
    maybeSendPushNotif(user, type, notif);

    sentUserList.push(user.uid);
};

exports.send = async function () {
    const userList = await getUserList();

    userList.forEach(async function (user) {
        const userData = await getUserData(user.uid);

        if (userData.lastKnownLocation) {
            const newHikes = await getNewHikes(userData);

            if (newHikes.length > 0) {
                const hid = newHikes[0];

                if (!sentUserList.includes(user.uid)) {
                    await maybeSendDigest(user, userData, hid);
                }
            }
        }
    });

    return true;
};
