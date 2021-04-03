const admin = require('firebase-admin');
const { sendUserHook } = require('../utils/slack');
const {
    deleteUserDocuments,
    deleteUserRecord,
    deleteUserImages,
} = require('../utils/user');

const auth = admin.auth();

exports.notifyUserSignup = async function (user) {
    sendUserHook(user);
};

exports.updatePassword = async function (uid, password) {
    let result;

    await auth
        .updateUser(uid, { password })
        .then((userRecord) => {
            result = userRecord.toJSON();
        })
        .catch((e) => {
            result = e.toJSON();
        });

    return result;
};

exports.deleteUserData = async function (deletedUser) {
    const { uid, photoURL } = deletedUser;

    if (photoURL) {
        await deleteUserImages(uid);
    }

    await deleteUserDocuments(uid);
    await deleteUserRecord(uid);
};
