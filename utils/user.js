const admin = require('firebase-admin');
const search = require('../functions/search');

const db = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();

exports.getUserData = async function (uid) {
    const userSnapshot = await db.collection('users').doc(uid).get();
    return userSnapshot.data();
};

exports.deleteUserDocuments = async function (uid) {
    await db.collection('users').doc(uid).delete();
    await db.collection('favoritedHikes').doc(uid).delete();
};

exports.deleteUserRecord = async function (uid) {
    await search.deleteUserRecord(uid);
};

exports.deleteUserImages = async function (uid) {
    const userImages = [
        `images/users/${uid}.jpg`,
        `images/users/covers/${uid}_750x750.jpg`,
        `images/users/thumbnails/${uid}_200x200.jpg`,
    ];

    userImages.map(async (image) => {
        await storage.bucket().file(image).delete();
    });

    return true;
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
