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

const indexName = async function (hid) {
    const hike = await getHikeData(hid);
    const data = {
        id: hid,
        name: hike.name,
    };

    writeToIndex(data, 'hikeName');
};

const indexCity = async function (hid) {
    const hike = await getHikeData(hid);
    const data = {
        id: hid,
        city: hike.city,
    };

    writeToIndex(data, 'hikeCity');
};

exports.indexRecords = async function (hid) {
    await indexName(hid);
    await indexCity(hid);

    return true;
};
