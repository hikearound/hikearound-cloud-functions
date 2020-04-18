const { senderData } = require('../constants/email');
const { buildTemplate } = require('../utils/email');
const { maybeSendPushNotif, maybeSendEmail } = require('../utils/send');
const { getHikeData, getNewHikes, getMapUrl } = require('../utils/hike');
const { getUserList } = require('../utils/user');
const { parseDescription } = require('../utils/helper');

const sentUserList = [];
const type = 'digest';

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
    const userList = await getUserList();
    const newHikes = await getNewHikes();

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
