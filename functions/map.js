const fs = require('fs');
const { parseString } = require('xml2js');
const polyline = require('google-polyline');
const buildUrl = require('build-url');
const functions = require('firebase-functions');
const download = require('image-downloader');
const path = require('path');
const os = require('os');

const mapApi = 'https://maps.googleapis.com/maps/api/staticmap';
const mapSize = '600x300';
const mapType = 'terrain';

const gpxPath = path.join(os.tmpdir(), './hike.gpx');
const imagePath = path.join(os.tmpdir(), './map.png');

const pathWeight = '4';
const pathColor = '935DFF';

const getHikeData = async function(storage, hid) {
    let hikeData = {};

    await storage
        .bucket()
        .file(`gpx/${hid}.gpx`)
        .download({
            destination: gpxPath,
        });

    const hikeGpx = fs.readFileSync(gpxPath);

    parseString(hikeGpx, (err, result) => {
        hikeData = JSON.parse(JSON.stringify(result));
    });

    return hikeData;
};

const setCenter = function(hikeMetaData) {
    const { maxlat, minlat, minlon, maxlon } = hikeMetaData;

    const lat = (parseFloat(maxlat) + parseFloat(minlat)) / 2;
    const lng = (parseFloat(maxlon) + parseFloat(minlon)) / 2;

    return `${lat},${lng}`;
};

const plotCoordinates = function(hikeData) {
    const coordinateCount = hikeData.gpx.rte[0].rtept.length;
    const coordinates = [];

    for (let i = 0, len = coordinateCount; i < len; i += 1) {
        const coordinate = hikeData.gpx.rte[0].rtept[i].$;
        coordinates.push([
            parseFloat(coordinate.lat),
            parseFloat(coordinate.lon),
        ]);
    }

    return coordinates;
};

const buildMapUrl = function(mapCenter, coordinates) {
    const encodedPolyline = polyline.encode(coordinates);
    const mapPath = `color:0x${pathColor}FF|weight:${pathWeight}|enc:${encodedPolyline}`;

    const mapUrl = buildUrl(mapApi, {
        queryParams: {
            size: mapSize,
            maptype: mapType,
            center: mapCenter,
            path: mapPath,
            key: functions.config().googlemaps.key,
        },
    });

    return mapUrl;
};

const saveMapUrl = async function(db, hid, mapUrl) {
    await db
        .collection('hikes')
        .doc(hid)
        .set({ mapUrl }, { merge: true });
};

const saveMapImage = async function(mapUrl, storage, hid) {
    await download.image({
        url: mapUrl,
        dest: imagePath,
    });

    await storage.bucket().upload(imagePath, {
        destination: `images/maps/${hid}.png`,
        metaData: { contentType: 'image/png' },
    });
};

exports.generateStaticMap = async function(storage, hid, db) {
    const hikeData = await getHikeData(storage, hid);
    const hikeMetaData = hikeData.gpx.metadata[0].bounds[0].$;
    const center = setCenter(hikeMetaData);
    const coordinates = plotCoordinates(hikeData);
    const mapUrl = await buildMapUrl(center, coordinates);

    saveMapUrl(db, hid, mapUrl);
    saveMapImage(mapUrl, storage, hid);

    return true;
};
