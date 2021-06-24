const { getReviewData, writeReviewData } = require('@utils/review');
const { getHikeData } = require('@utils/hike');
const { sendReviewHook } = require('@utils/slack');

let average = 0;
let count = 0;

exports.addReviewToAverage = async function (rid) {
    const review = await getReviewData(rid);
    const hike = await getHikeData(review.hid);

    review.rid = rid;

    if (hike.review) {
        average = hike.review.average;
        count = hike.review.count;
    }

    await writeReviewData(review.hid, {
        average: (count * average + review.rating) / (count + 1),
        count: count + 1,
    });

    await sendReviewHook({ review, hike });
};

exports.updateAverageReview = async function (rid, snapshot) {
    const review = snapshot.after.data();
    const originalReview = snapshot.before.data();
    const hike = await getHikeData(originalReview.hid);

    if (hike.review.count > 1) {
        average =
            (hike.review.count * hike.review.average - originalReview.rating) /
            (hike.review.count - 1);
    }

    average =
        ((hike.review.count - 1) * average + review.rating) / hike.review.count;

    await writeReviewData(review.hid, { average, count: hike.review.count });
};

exports.removeReviewFromAverage = async function (snapshot) {
    const review = snapshot.data();
    const hike = await getHikeData(review.hid);

    if (hike.review.count > 1) {
        average =
            (hike.review.count * hike.review.average - review.rating) /
            (hike.review.count - 1);
    }

    await writeReviewData(review.hid, {
        average,
        count: hike.review.count - 1,
    });
};
