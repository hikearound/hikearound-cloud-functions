const { buildEmail } = require('../utils/email');
const { maybeSendPushNotif, maybeSendEmail } = require('../utils/send');
const {
    getHikeData,
    getHikeImageGallery,
    getNewHikes,
    getMapUrl,
    getRoute,
} = require('../utils/hike');
const { getUserList, getUserData } = require('../utils/user');
const { translate } = require('../utils/i18n');
const { parseDescription, getFirstName } = require('../utils/helper');
const { buildImageArray } = require('../utils/image');

const sentUserList = [];
const type = 'digest';

const buildData = async function (user, userData, hid) {
    const data = {};

    const t = translate(userData);
    const hike = await getHikeData(hid);
    const mapDark = await getMapUrl(hid, 'dark');
    const mapLight = await getMapUrl(hid, 'light');
    const { images, count } = await getHikeImageGallery(hid);

    // Shared data
    data.t = t;
    data.hid = hid;
    data.hike = hike;
    data.uid = user.uid;

    data.gallery = buildImageArray(images, count);
    data.map = { light: { url: mapLight }, dark: { url: mapDark } };

    // Notif data
    data.notif.title = t('notif.digest.title');
    data.notif.body = t('notif.digest.body', { name: data.hike.name });

    // Email data
    data.email.type = type;
    data.email.toAddress = user.email;

    data.email.subject = t('email.digest.subject', { name: hike.name });
    data.email.cta = t('email.digest.cta');

    data.email.heading = {
        description: t('common.description'),
        map: t('common.map'),
        gallery: t('common.gallery'),
    };

    data.email.intro = t('email.digest.intro', {
        name: getFirstName(userData.name),
        location: userData.lastKnownLocation.location,
    });

    data.email.body = t('email.digest.body', {
        hid,
        name: hike.name,
        city: hike.city,
        state: hike.state,
        distance: hike.distance,
        elevation: hike.elevation,
        route: getRoute(hike.route),
        description: parseDescription(hike.description),
    });

    // Settings
    data.includeTypeUnsubscribe = true;

    return data;
};

const markDigestAsSent = function (uid) {
    sentUserList.push(uid);
};

const maybeSendDigest = async function (user, userData, hid) {
    const data = await buildData(user, userData, hid);
    const email = await buildEmail(data, type);

    maybeSendEmail(user, type, email);
    maybeSendPushNotif(user, type, data);
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
                    markDigestAsSent(user.uid);

                    // if (user.uid === 'woEsITvCBDWiotEmNTJpLnyLU7r2') {
                    //     await maybeSendDigest(user, userData, hid);
                    // }

                    await maybeSendDigest(user, userData, hid);
                }
            }
        }
    });

    return true;
};
