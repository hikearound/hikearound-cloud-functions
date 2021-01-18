const admin = require('firebase-admin');

const storage = admin.storage();

exports.getImageUrl = async function (path) {
    const url = await storage.bucket().file(path).getSignedUrl({
        action: 'read',
        expires: '01-01-2050',
    });

    if (url) {
        return url[0];
    }

    return false;
};
