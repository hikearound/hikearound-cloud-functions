const sentry = require('@sentry/node');
const { initializeAlgolia } = require('../utils/config');
const { getHikeData } = require('../utils/hike');

const writeToIndex = async function (data, indexName) {
    const client = initializeAlgolia();
    const index = client.initIndex(indexName);

    index.saveObjects([data]).catch((e) => {
        sentry.captureException(e);
    });

    return true;
};

const deleteFromIndex = async function (objectID, indexName) {
    const client = initializeAlgolia();
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

const indexUser = async function (uid, user) {
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

exports.indexUserRecord = async function (uid, snapshot) {
    const user = snapshot.after.data();
    await indexUser(uid, user);
};

exports.deleteUserRecord = async function (uid) {
    await deleteFromIndex(uid, 'users');
};
