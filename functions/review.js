const { getReviewData, writeReviewData } = require('../utils/review');
const { getHikeData } = require('../utils/hike');

exports.addReviewToAverage = async function (rid) {
    const review = await getReviewData(rid);
    const hike = await getHikeData(review.hid);

    let average = 0;
    let count = 0;

    if (hike.review) {
        average = hike.review.average;
        count = hike.review.count;
    }

    const reviewData = {
        average: (count * average + review.rating) / (count + 1),
        count: count + 1,
    };

    await writeReviewData(review.hid, reviewData);
};

exports.updateAverageReview = async function (rid, snapshot) {
    const originalReview = snapshot.before.data();
    const review = snapshot.after.data();
    const hike = await getHikeData(originalReview.hid);

    let average = 0;

    if (hike.review.count > 1) {
        average =
            (hike.review.count * hike.review.average - originalReview.rating) /
            (hike.review.count - 1);
    }

    average =
        ((hike.review.count - 1) * average + review.rating) / hike.review.count;

    const reviewData = {
        average,
        count: hike.review.count,
    };

    await writeReviewData(review.hid, reviewData);
};

exports.removeReviewFromAverage = async function (snapshot) {
    const review = snapshot.data();
    const hike = await getHikeData(review.hid);

    let average = 0;

    if (hike.review.count > 1) {
        average =
            (hike.review.count * hike.review.average - review.rating) /
            (hike.review.count - 1);
    }

    const reviewData = {
        average,
        count: hike.review.count - 1,
    };

    await writeReviewData(review.hid, reviewData);
};
