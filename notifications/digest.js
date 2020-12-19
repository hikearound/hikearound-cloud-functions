const { buildEmail } = require('../utils/email');
const { maybeSendPushNotif, maybeSendEmail } = require('../utils/send');
const {
    getHikeData,
    getNewHikes,
    getMapUrl,
    getRoute,
} = require('../utils/hike');
const { getUserList, getUserData } = require('../utils/user');
const { parseDescription, getFirstName } = require('../utils/helper');

const sentUserList = [];
const type = 'digest';

const buildData = async function (user, userData, hid) {
    const hike = await getHikeData(hid);
    const lightMap = await getMapUrl(hid, 'light');
    const darkMap = await getMapUrl(hid, 'dark');

    const title = 'Check out this weeks best hikes';
    const upsell = `Get ready for the weekend by checking out ${hike.name} and other hikes we think you might like.`;

    const data = { hid, lightMap, darkMap };

    // Notification data
    data.notifBody = upsell;
    data.notifTitle = title;

    // Email data
    data.emailType = type;
    data.emailSubject = upsell;
    data.emailToAddress = user.email;

    // User data
    data.uid = user.uid;
    data.name = getFirstName(userData.name);
    data.location = userData.lastKnownLocation.location;

    // Hike data
    data.hikeName = hike.name;
    data.hikeCity = hike.city;
    data.hikeState = hike.state;
    data.hikeDistance = hike.distance;
    data.hikeElevation = hike.elevation;
    data.hikeRoute = getRoute(hike.route);
    data.hikeDescription = parseDescription(hike.description);

    // Settings
    data.includeTypeUnsubscribe = true;

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

const maybeSendDigest = async function (user, userData, hid) {
    const data = await buildData(user, userData, hid);
    const email = await buildEmail(data, type);
    const notif = await buildNotif(user, data);

    maybeSendEmail(user, type, email);
    maybeSendPushNotif(user, type, notif);
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
                    sentUserList.push(user.uid);
                    await maybeSendDigest(user, userData, hid);
                }
            }
        }
    });

    return true;
};
