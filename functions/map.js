const fetch = require('node-fetch');
const { parseString } = require('xml2js');
const polyline = require('google-polyline');
const buildUrl = require('build-url');
const functions = require('firebase-functions');

const mapApi = 'https://maps.googleapis.com/maps/api/staticmap';
const mapSize = '400x400';
const mapType = 'terrain';

const pathWeight = '4';
const pathColor = '935DFF';

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

exports.generateStaticMap = async function(hikeXmlUrl) {
    let hikeData = {};

    await fetch(hikeXmlUrl)
        .then((response) => response.text())
        .then((response) => {
            parseString(response, (err, result) => {
                hikeData = JSON.parse(JSON.stringify(result));
            });
        });

    const hikeMetaData = hikeData.gpx.metadata[0].bounds[0].$;
    const center = setCenter(hikeMetaData);
    const coordinates = plotCoordinates(hikeData);
    const mapUrl = buildMapUrl(center, coordinates);

    if (mapUrl) {
        return mapUrl;
    }

    return false;
};
