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
