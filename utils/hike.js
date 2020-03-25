const admin = require('firebase-admin');

const db = admin.firestore();
const storage = admin.storage();

exports.getHikeData = async function(hid) {
    const hikeSnapshot = await db
        .collection('hikes')
        .doc(hid)
        .get();

    return hikeSnapshot.data();
};

exports.getRecentHikes = async function() {
    const hikeRef = await db
        .collection('hikes')
        .orderBy('timestamp', 'desc')
        .limit(5);

    const querySnapshot = await hikeRef.get();
    return querySnapshot;
};

exports.getMapUrl = async function(hid) {
    const mapUrl = await storage
        .bucket()
        .file(`images/maps/${hid}.png`)
        .getSignedUrl({
            action: 'read',
            expires: '01-01-2050',
        });

    return mapUrl[0];
};
