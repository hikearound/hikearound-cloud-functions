const admin = require('firebase-admin');
const moment = require('moment');
const { app } = require('../constants/app');

const db = admin.firestore();

exports.getHikeData = async function (hid) {
    const hikeSnapshot = await db.collection('hikes').doc(hid).get();
    return hikeSnapshot.data();
};

exports.getHikeImageGallery = async function (hid) {
    const gallerySnapshot = await db.collection('images').doc(hid).get();
    const images = gallerySnapshot.data();
    const count = Object.keys(images).length;

    return { images, count };
};

exports.getNearbyHikes = async function (range) {
    const hikeRef = await db
        .collection('hikes')
        .where('geohash', '>=', range.lower)
        .where('geohash', '<=', range.upper)
        .orderBy('geohash')
        .limit(5);

    const querySnapshot = await hikeRef.get();
    return querySnapshot;
};

exports.getMapUrl = function (hid, scheme) {
    const path = `images/maps/${scheme}/${hid}.png`;
    return `${app.storageUrl}${encodeURIComponent(path)}?alt=media`;
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
