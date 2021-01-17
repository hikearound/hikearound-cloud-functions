const admin = require('firebase-admin');
const tools = require('firebase-tools');
const functions = require('firebase-functions');
const sentry = require('@sentry/node');
const search = require('../functions/search');

const db = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();

exports.getUserData = async function (uid) {
    const userSnapshot = await db.collection('users').doc(uid).get();
    const userData = userSnapshot.data();

    if (!userData.lang) {
        userData.lang = 'en';
    }

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
    const userImages = [
        `images/users/${uid}.jpg`,
        `images/users/covers/${uid}_750x750.jpg`,
        `images/users/thumbnails/${uid}_200x200.jpg`,
    ];

    userImages.map(async (image) => {
        try {
            await storage.bucket().file(image).delete();
        } catch (e) {
            sentry.captureException(e);
        }
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
