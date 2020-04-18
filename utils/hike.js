const admin = require('firebase-admin');
const moment = require('moment');

const db = admin.firestore();
const storage = admin.storage();

exports.getHikeData = async function (hid) {
    const hikeSnapshot = await db.collection('hikes').doc(hid).get();
    return hikeSnapshot.data();
};

exports.getRecentHikes = async function () {
    const hikeRef = await db
        .collection('hikes')
        .orderBy('timestamp', 'desc')
        .limit(5);

    const querySnapshot = await hikeRef.get();
    return querySnapshot;
};

exports.getMapUrl = async function (hid) {
    const mapUrl = await storage
        .bucket()
        .file(`images/maps/${hid}.png`)
        .getSignedUrl({
            action: 'read',
            expires: '01-01-2050',
        });

    return mapUrl[0];
};

exports.getNewHikes = async function () {
    const now = moment();
    const newHikes = [];
    const recentHikes = await exports.getRecentHikes();

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
