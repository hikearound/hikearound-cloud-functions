const admin = require('firebase-admin');
const {
    deleteUserDocuments,
    deleteUserRecord,
    deleteUserImages,
} = require('../utils/user');

const auth = admin.auth();

exports.updatePassword = async function (uid, password) {
    let result;

    await auth
        .updateUser(uid, { password })
        .then(function (userRecord) {
            result = userRecord.toJSON();
        })
        .catch(function (error) {
            result = error.toJSON();
        });

    return result;
};

exports.deleteUserData = async function (uid) {
    await deleteUserDocuments(uid);
    await deleteUserRecord(uid);
    await deleteUserImages(uid);
};
