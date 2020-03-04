const admin = require('firebase-admin');
const sentry = require('@sentry/node');

const db = admin.firestore();
const auth = admin.auth();

const getToken = async function(uid) {
    const authSnapshot = await db
        .collection('auth')
        .doc(uid)
        .get();

    const data = authSnapshot.data();
    return data.idToken;
};

const updateUserRecord = async function(uid) {
    auth.updateUser(uid, {
        emailVerified: true,
    });

    db.collection('users')
        .doc(uid)
        .set({ emailVerified: true }, { merge: true });
};

const verifyToken = async function(idToken) {
    auth.verifyIdToken(idToken)
        .then(function(decodedToken) {
            updateUserRecord(decodedToken.uid);
        })
        .catch(function(e) {
            sentry.captureException(e);
        });
};

const deleteAuthDocument = async function(uid) {
    db.collection('auth')
        .doc(uid)
        .delete();
};

exports.verifyEmailAddress = async function(uid) {
    const idToken = await getToken(uid);
    await verifyToken(idToken);
    await deleteAuthDocument(uid);

    return true;
};
