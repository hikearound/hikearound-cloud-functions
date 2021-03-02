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
const { dataFormat } = require('../constants/notif');

const type = 'digest';

const buildData = async function (user, userData, hid) {
    const data = dataFormat;
    const t = translate(userData);
    const hike = await getHikeData(hid);
    const { images, count } = await getHikeImageGallery(hid);

    const mapDark = await getMapUrl(hid, 'dark');
    const mapLight = await getMapUrl(hid, 'light');

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
    data.notif.data = { hid, recipientUid: data.uid };

    // Email data
    data.email.type = type;
    data.email.toAddress = user.email;

    data.email.subject = t('email.digest.subject', { name: hike.name });
    data.email.cta.text = t('email.digest.cta');
    data.email.cta.path = `hike/${hid}`;

    data.email.heading = {
        description: t('common.description'),
        map: t('common.map'),
        gallery: t('common.gallery'),
    };

    data.email.body = t('email.digest.body', {
        name: getFirstName(userData.name),
        location: userData.lastKnownLocation.location,
    });

    data.email.description = t('email.digest.description', {
        hid,
        name: hike.name,
        city: hike.city,
        state: hike.state,
        distance: hike.distance,
        elevation: hike.elevation,
        route: getRoute(hike.route),
        description: parseDescription(hike.description),
    });

    data.email.footer = {
        salutation: t('email.digest.salutation'),
    };

    // Settings
    data.includeTypeUnsubscribe = true;

    return data;
};

const maybeSendDigest = async function (user, userData, hid) {
    const data = await buildData(user, userData, hid);
    const email = await buildEmail(data, type);

    maybeSendEmail(user, type, email);
    maybeSendPushNotif(user, type, data);
};

exports.send = async function () {
    const userList = await getUserList();

    userList.forEach(async (user) => {
        const userData = await getUserData(user.uid);

        if (userData.lastKnownLocation) {
            const hikes = await getNewHikes(userData);

            if (hikes.length > 0) {
                await maybeSendDigest(user, userData, hikes[0]);
            }
        }
    });

    return true;
};
