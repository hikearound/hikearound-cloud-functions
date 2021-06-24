const functions = require('firebase-functions');
const axios = require('axios');
const { getUserData } = require('@utils/user');

exports.sendUserHook = async function (user) {
    const { name, email } = user;

    const options = {
        text: `<mailto:${email}|${name}> signed up for Hikearound. :tada:`,
    };

    await exports.sendMessage(options);
};

exports.sendReviewHook = async function (data) {
    const { review, hike } = data;

    const rating = ':star:'.repeat(review.rating);
    const user = await getUserData(review.uid);

    const options = {
        text: `${user.name} left a new review for ${hike.name}.`,
        blocks: [
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `<mailto:${user.email}|${user.name}> left the following review:`,
                },
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `<https://www.tryhikearound.com/hike/${review.hid}|${hike.name}>\n${rating}\n${review.review}`,
                },
                accessory: {
                    type: 'image',
                    image_url: hike.coverPhoto,
                    alt_text: `A photo of ${hike.name}.`,
                },
            },
        ],
    };

    await exports.sendMessage(options);
};

exports.sendMessage = async function (options) {
    axios.post(functions.config().slack.webhook.url, JSON.stringify(options));
};
