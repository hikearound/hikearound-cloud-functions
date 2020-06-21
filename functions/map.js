const admin = require('firebase-admin');
const fs = require('fs');
const { parseString } = require('xml2js');
const buildUrl = require('build-url');
const download = require('image-downloader');
const path = require('path');
const os = require('os');
const { sign } = require('jwa')('ES256');
const { ids, api, config } = require('../constants/map');
const { setCenter, setSpan, setOverlay } = require('../utils/map');

const db = admin.firestore();
const storage = admin.storage();

const getHikeData = async function (hid) {
    const gpxPath = path.join(os.tmpdir(), './hike.gpx');
    let hikeData = {};

    await storage.bucket().file(`gpx/${hid}.gpx`).download({
        destination: gpxPath,
    });

    const hikeGpx = fs.readFileSync(gpxPath);

    parseString(hikeGpx, (err, result) => {
        hikeData = JSON.parse(JSON.stringify(result));
    });

    return hikeData;
};

const generateSignature = function (url) {
    const privateKey = fs.readFileSync(`${__dirname}/../mapkit.p8`, 'utf8');
    return sign(url, privateKey);
};

const buildMapUrl = function (center, spn, overlays, colorScheme) {
    const { scale, size, poi } = config;
    const { teamId, keyId } = ids;

    const mapUrl = buildUrl(api.map, {
        queryParams: {
            size,
            teamId,
            keyId,
            scale,
            colorScheme,
            center,
            spn,
            overlays,
            poi,
        },
    });

    const signature = generateSignature(mapUrl);
    return `${api.base}${mapUrl}&signature=${signature}`;
};

const saveMapUrl = async function (hid, mapUrl, colorScheme) {
    await db
        .collection('maps')
        .doc(hid)
        .set({ [colorScheme]: mapUrl }, { merge: true });
};

const saveMapImage = async function (mapUrl, hid, colorScheme) {
    const imagePath = path.join(os.tmpdir(), `./map${colorScheme}.png`);

    await download.image({
        url: mapUrl,
        dest: imagePath,
    });

    await storage.bucket().upload(imagePath, {
        destination: `images/maps/${colorScheme}/${hid}.png`,
        metaData: { contentType: 'image/png' },
    });
};

exports.generateStaticMap = async function (hid) {
    const hikeData = await getHikeData(hid);
    const center = setCenter(hikeData);
    const spn = setSpan(hikeData);
    const overlays = setOverlay(hikeData);

    config.colorSchemes.forEach(async function (scheme) {
        const mapUrl = await buildMapUrl(center, spn, overlays, scheme);

        saveMapUrl(hid, mapUrl, scheme);
        saveMapImage(mapUrl, hid, scheme);
    });

    return true;
};
