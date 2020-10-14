const admin = require('firebase-admin');
const search = require('../functions/search');

const db = admin.firestore();
const auth = admin.auth();

exports.getUserData = async function (uid) {
    const userSnapshot = await db.collection('users').doc(uid).get();
    return userSnapshot.data();
};

exports.deleteUserData = async function (uid) {
    db.collection('users').doc(uid).delete();
    db.collection('favoritedHikes').doc(uid).delete();
    return search.deleteUserRecord(uid);
};

exports.getUserList = async function () {
    const userList = [];
    const tokenIterator = 1000;

    const buildUserList = async function (nextPageToken) {
        await auth
            .listUsers(tokenIterator, nextPageToken)
            .then(function (listUsersResult) {
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
