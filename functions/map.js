const admin = require('firebase-admin');
const fs = require('fs');
const { parseString } = require('xml2js');
const buildUrl = require('build-url');
const download = require('image-downloader');
const path = require('path');
const os = require('os');
const { sign } = require('jwa')('ES256');

const db = admin.firestore();
const storage = admin.storage();

const teamId = '2DS67Q47ES';
const keyId = 'Q5YUQ678YQ';

const baseUrl = 'https://snapshot.apple-mapkit.com';
const mapApi = '/api/v1/snapshot';

const size = '550x275';
const colorScheme = 'light';
const strokeColor = '935DFF';

const scale = 2;
const latModifier = 0.005;
const lineWidth = 2;

const gpxPath = path.join(os.tmpdir(), './hike.gpx');
const imagePath = path.join(os.tmpdir(), './map.png');

const getHikeData = async function (hid) {
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

const setCenter = function (hikeData) {
    const hikeMetaData = hikeData.gpx.metadata[0].bounds[0].$;
    const { maxlat, minlat, minlon, maxlon } = hikeMetaData;

    const lat = (parseFloat(maxlat) + parseFloat(minlat)) / 2;
    const lng = (parseFloat(maxlon) + parseFloat(minlon)) / 2;

    return `${lat},${lng}`;
};

const setSpan = function (hikeData) {
    const hikeMetaData = hikeData.gpx.metadata[0].bounds[0].$;
    const { maxlat, minlat, minlon, maxlon } = hikeMetaData;

    return [maxlat - minlat + latModifier, maxlon - minlon];
};

const setOverlay = function (hikeData) {
    const pointCount = hikeData.gpx.trk[0].trkseg[0].trkpt.length;
    let points = [];

    for (let i = 0, len = pointCount; i < len; i += 1) {
        if (i % 3 === 0) {
            const coordinate = hikeData.gpx.trk[0].trkseg[0].trkpt[i].$;
            points.push(`${coordinate.lat},${coordinate.lon}`);
        }
    }

    points = points.slice(0, 120);
    return JSON.stringify([{ points, strokeColor, lineWidth }]);
};

const generateSignature = function (url) {
    const privateKey = fs.readFileSync(`${__dirname}/../mapkit.p8`, 'utf8');
    return sign(url, privateKey);
};

const buildMapUrl = function (center, spn, overlays) {
    const mapUrl = buildUrl(mapApi, {
        queryParams: {
            size,
            teamId,
            keyId,
            scale,
            colorScheme,
            center,
            spn,
            overlays,
        },
    });

    const signature = generateSignature(mapUrl);
    return `${baseUrl}${mapUrl}&signature=${signature}`;
};

const saveMapUrl = async function (hid, mapUrl) {
    await db.collection('maps').doc(hid).set({ url: mapUrl }, { merge: true });
};

const saveMapImage = async function (mapUrl, hid) {
    await download.image({
        url: mapUrl,
        dest: imagePath,
    });

    await storage.bucket().upload(imagePath, {
        destination: `images/maps/${hid}.png`,
        metaData: { contentType: 'image/png' },
    });
};

exports.generateStaticMap = async function (hid) {
    const hikeData = await getHikeData(hid);
    const center = setCenter(hikeData);
    const spn = setSpan(hikeData);
    const overlays = setOverlay(hikeData);
    const mapUrl = await buildMapUrl(center, spn, overlays);

    saveMapUrl(hid, mapUrl);
    saveMapImage(mapUrl, hid);

    return true;
};
