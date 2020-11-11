const { getReviewData, writeReviewData } = require('../utils/review');
const { getHikeData } = require('../utils/hike');

exports.addReviewToAverage = async function (rid) {
    const review = await getReviewData(rid);
    const hike = await getHikeData(review.hid);

    let averageReview = 0;
    let reviewCount = 0;

    if (hike.averageReview && hike.reviewCount) {
        averageReview = hike.averageReview;
        reviewCount = hike.reviewCount;
    }

    const reviewData = {
        averageReview:
            (reviewCount * averageReview + review.rating) / (reviewCount + 1),
        reviewCount: reviewCount + 1,
    };

    await writeReviewData(review.hid, reviewData);
};

exports.updateAverageReview = async function (rid, snapshot) {
    const originalReview = snapshot.before.data();
    const review = snapshot.after.data();
    const hike = await getHikeData(originalReview.hid);

    let averageReview = 0;

    if (hike.reviewCount > 1) {
        averageReview =
            (hike.reviewCount * hike.averageReview - review.rating) /
            (hike.reviewCount - 1);
    }

    averageReview =
        ((hike.reviewCount - 1) * averageReview + review.rating) /
        hike.reviewCount;

    const reviewData = {
        averageReview,
        reviewCount: hike.reviewCount,
    };

    await writeReviewData(review.hid, reviewData);
};

exports.removeReviewFromAverage = async function (snapshot) {
    const review = snapshot.data();
    const hike = await getHikeData(review.hid);

    let averageReview = 0;

    if (hike.reviewCount > 1) {
        averageReview =
            (hike.reviewCount * hike.averageReview - review.rating) /
            (hike.reviewCount - 1);
    }

    const reviewData = {
        averageReview,
        reviewCount: hike.reviewCount - 1,
    };

    await writeReviewData(review.hid, reviewData);
};
