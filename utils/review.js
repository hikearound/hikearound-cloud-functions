const admin = require('firebase-admin');

const db = admin.firestore();

exports.getReviewData = async function (rid) {
    const reviewSnapshot = await db.collection('reviews').doc(rid).get();
    return reviewSnapshot.data();
};

exports.writeReviewData = async function (hid, reviewData) {
    db.collection('hikes')
        .doc(hid)
        .set({ review: reviewData }, { merge: true });
};
