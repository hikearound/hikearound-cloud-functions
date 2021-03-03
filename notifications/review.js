const { maybeSendPushNotif } = require('../utils/send');
const { getHikeData } = require('../utils/hike');
const { translate } = require('../utils/i18n');
const { dataFormat } = require('../constants/notif');
const { getUserData } = require('../utils/user');

const type = 'reviewLike';

const buildSenderData = async function (review) {
    const uid = review.userLikes[review.userLikes.length - 1];
    const userData = await getUserData(uid);

    userData.uid = uid;
    return userData;
};

const buildData = async function (rid, user, snapshot) {
    const data = dataFormat;
    const review = snapshot.after.data();

    const t = translate(user);
    const hike = await getHikeData(review.hid);
    const sender = await buildSenderData(review);

    // Shared data
    data.t = t;
    data.type = type;
    data.uid = user.uid;
    data.hid = review.hid;
    data.recipientUid = review.uid;

    // Notif data
    data.notif.title = t('notif.reviewLike.title', { name: sender.name });

    data.notif.body = t('notif.reviewLike.body', {
        name: hike.name,
        city: hike.city,
        state: hike.state,
    });

    data.notif.data = {
        senderUid: sender.uid,
        recipientUid: data.recipientUid,
    };

    return data;
};

const buildRecipientData = async function (snapshot) {
    const review = snapshot.after.data();

    return {
        uid: review.uid,
    };
};

const checkNewLikes = async function (snapshot) {
    const review = snapshot.after.data();
    const originalReview = snapshot.before.data();

    if (review.userLikes.length > originalReview.userLikes.length) {
        return true;
    }

    return false;
};

const checkUniqueUsers = async function (snapshot) {
    const review = snapshot.after.data();

    const recipientUid = review.uid;
    const uid = review.userLikes[review.userLikes.length - 1];

    if (recipientUid !== uid) {
        return true;
    }

    return false;
};

exports.send = async function (rid, snapshot) {
    const newLikes = await checkNewLikes(snapshot);
    const uniqueUsers = await checkUniqueUsers(snapshot);

    if (newLikes && uniqueUsers) {
        const user = await buildRecipientData(snapshot);
        const data = await buildData(rid, user, snapshot);

        maybeSendPushNotif(user, type, data);
    }
};
