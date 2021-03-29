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

const cachedHikes = {};
const cachedGalleries = {};

const cacheData = async function (hid) {
    const hike = await getHikeData(hid);
    const gallery = await getHikeImageGallery(hid);

    cachedHikes.hid = hike;
    cachedGalleries.hid = gallery;

    return { hike, gallery };
};

const buildData = async function (user, userData, hid) {
    const data = dataFormat;
    const t = translate(userData);

    let hike = cachedHikes[hid];
    let gallery = cachedGalleries[hid];

    if (!(hid in cachedHikes)) {
        const result = await cacheData(hid);
        hike = result.hike;
        gallery = result.gallery;
    }

    const mapDark = getMapUrl(hid, 'dark');
    const mapLight = getMapUrl(hid, 'light');

    // Shared data
    data.t = t;
    data.hid = hid;
    data.type = type;
    data.hike = hike;
    data.uid = user.uid;

    data.gallery = buildImageArray(gallery.images, gallery.count);
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
    const email = buildEmail(data, type);

    maybeSendEmail(user, userData, type, email);
    await maybeSendPushNotif(user, userData, type, data);
};

exports.send = async function () {
    const userList = await getUserList();

    const promises = userList.map(async (user) => {
        const userData = await getUserData(user.uid);

        if (userData.lastKnownLocation) {
            const hikes = await getNewHikes(userData);

            if (hikes.length > 0) {
                await maybeSendDigest(user, userData, hikes[0]);
            }
        }
    });

    return Promise.all(promises);
};
