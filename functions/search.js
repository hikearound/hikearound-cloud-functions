const functions = require('firebase-functions');
const algoliasearch = require('algoliasearch');
const sentry = require('@sentry/node');
const { getHikeData } = require('../utils/hike');

const appId = functions.config().algolia.id;
const adminKey = functions.config().algolia.admin_key;
const client = algoliasearch(appId, adminKey);

const writeToIndex = async function (data, indexName) {
    const index = client.initIndex(indexName);

    index.saveObjects([data]).catch((e) => {
        sentry.captureException(e);
    });
};

const indexHike = async function (hid) {
    const hike = await getHikeData(hid);

    const data = {
        objectID: hid,
        name: hike.name,
        city: hike.city,
        state: hike.state,
        description: hike.description,
        distance: hike.distance,
        route: hike.route,
        difficulty: hike.difficulty,
    };

    writeToIndex(data, 'hikes');
};

exports.indexRecords = async function (hid) {
    await indexHike(hid);
    return true;
};
