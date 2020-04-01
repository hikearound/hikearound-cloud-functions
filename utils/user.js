const admin = require('firebase-admin');

const db = admin.firestore();

exports.getUserData = async function (uid) {
    const userSnapshot = await db.collection('users').doc(uid).get();

    return userSnapshot.data();
};
