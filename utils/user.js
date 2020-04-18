const admin = require('firebase-admin');

const db = admin.firestore();
const auth = admin.auth();

exports.getUserData = async function (uid) {
    const userSnapshot = await db.collection('users').doc(uid).get();
    return userSnapshot.data();
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
