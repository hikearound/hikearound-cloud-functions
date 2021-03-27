const admin = require('firebase-admin');
const tools = require('firebase-tools');
const functions = require('firebase-functions');
const search = require('../functions/search');

const db = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();

exports.getUserData = async function (uid) {
    const userSnapshot = await db.collection('users').doc(uid).get();
    const userData = userSnapshot.data();
    const user = await auth.getUser(uid);

    userData.lang = 'en';
    userData.email = user.email;
    userData.uid = uid;

    return userData;
};

exports.deleteUserDocuments = async function (uid) {
    await db.collection('users').doc(uid).delete();

    await tools.firestore.delete(`/favoritedHikes/${uid}`, {
        project: process.env.GCLOUD_PROJECT,
        recursive: true,
        yes: true,
        token: functions.config().fb.token,
    });
};

exports.deleteUserRecord = async function (uid) {
    await search.deleteUserRecord(uid);
};

exports.deleteUserImages = async function (uid) {
    await storage.bucket().file(`images/users/${uid}.jpg`).delete();
};

exports.getUserList = async function () {
    const userList = [];
    const tokenIterator = 1000;

    const buildUserList = async function (nextPageToken) {
        await auth
            .listUsers(tokenIterator, nextPageToken)
            .then((listUsersResult) => {
                listUsersResult.users.forEach((user) => {
                    const userData = user.toJSON();
                    userList.push(userData);
                });
                if (listUsersResult.pageToken) {
                    buildUserList(listUsersResult.pageToken);
                }
            });
    };

    await buildUserList();
    return userList;
};
