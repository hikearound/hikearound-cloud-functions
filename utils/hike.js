const admin = require('firebase-admin');
const moment = require('moment');

const db = admin.firestore();
const storage = admin.storage();

exports.getHikeData = async function (hid) {
    const hikeSnapshot = await db.collection('hikes').doc(hid).get();
    return hikeSnapshot.data();
};

exports.getNearbyHikes = async function (range) {
    const hikeRef = await db
        .collection('hikes')
        .where('geohash', '>=', range.lower)
        .where('geohash', '<=', range.upper)
        .orderBy('geohash')
        .limit(20);

    const querySnapshot = await hikeRef.get();
    return querySnapshot;
};

exports.getMapUrl = async function (hid, scheme) {
    const mapUrl = await storage
        .bucket()
        .file(`images/maps/${scheme}/${hid}.png`)
        .getSignedUrl({
            action: 'read',
            expires: '01-01-2050',
        });

    return mapUrl[0];
};

exports.getNewHikes = async function (userData) {
    const now = moment();
    const newHikes = [];

    const { range } = userData.lastKnownLocation;
    const nearbyHikes = await exports.getNearbyHikes(range);

    nearbyHikes.forEach((hike) => {
        if (hike.exists) {
            const hikeData = hike.data() || {};
            const createdOn = moment(hikeData.createdOn.toDate());
            const daysOld = now.diff(createdOn, 'days');

            if (daysOld <= 7) {
                newHikes.push(hike.id);
            }
        }
    });

    return newHikes;
};

exports.getRoute = function (route) {
    route = route.toLowerCase();

    if (route === 'out') {
        return 'out & back';
    }

    return route;
};
