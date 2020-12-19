const functions = require('firebase-functions');
const algoliasearch = require('algoliasearch');
const sentry = require('@sentry/node');
const { getHikeData } = require('../utils/hike');
const { getUserData } = require('../utils/user');

const appId = functions.config().algolia.id;
const adminKey = functions.config().algolia.admin_key;
const client = algoliasearch(appId, adminKey);

const writeToIndex = async function (data, indexName) {
    const index = client.initIndex(indexName);

    index.saveObjects([data]).catch((e) => {
        sentry.captureException(e);
    });

    return true;
};

const deleteFromIndex = async function (objectID, indexName) {
    const index = client.initIndex(indexName);

    index.deleteObject(objectID).catch((e) => {
        sentry.captureException(e);
    });

    return true;
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

const indexUser = async function (uid) {
    const user = await getUserData(uid);

    const data = {
        objectID: uid,
        name: user.name,
        location: user.location,
        photoURL: user.photoURL,
    };

    writeToIndex(data, 'users');
};

exports.indexHikeRecord = async function (hid) {
    await indexHike(hid);
};

exports.deleteHikeRecord = async function (hid) {
    await deleteFromIndex(hid, 'hikes');
};

exports.indexUserRecord = async function (uid) {
    await indexUser(uid);
};

exports.deleteUserRecord = async function (uid) {
    await deleteFromIndex(uid, 'users');
};
