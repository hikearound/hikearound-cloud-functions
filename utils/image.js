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

exports.buildImageArray = function (images, imageCount) {
    const imageArray = [];

    for (let i = 0; i < imageCount; i += 1) {
        imageArray.push({
            url: images[i].uri.thumbnail,
            attribution: images[i].attribution,
        });
    }

    return imageArray;
};
