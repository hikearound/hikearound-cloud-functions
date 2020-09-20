const admin = require('firebase-admin');

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
