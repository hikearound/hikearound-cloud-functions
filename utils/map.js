const polyline = require('google-polyline');
const { config } = require('../constants/map');

exports.setCenter = function (hikeData) {
    const { coordinates } = hikeData;
    const hikeMetaData = coordinates.gpx.metadata[0].bounds[0].$;
    const { maxlat, minlat, minlon, maxlon } = hikeMetaData;

    const lat = (parseFloat(maxlat) + parseFloat(minlat)) / 2;
    const lng = (parseFloat(maxlon) + parseFloat(minlon)) / 2;

    return `${lat},${lng}`;
};

exports.setSpan = function (hikeData) {
    const { coordinates } = hikeData;
    const hikeMetaData = coordinates.gpx.metadata[0].bounds[0].$;
    const { maxlat, minlat, minlon, maxlon } = hikeMetaData;

    return [maxlat - minlat + config.latModifier, maxlon - minlon];
};

exports.setOverlay = function (hikeData) {
    const points = [];

    const { coordinates } = hikeData;
    const data = coordinates.gpx.trk[0].trkseg[0].trkpt;
    const coordinateCount = data.length;
    const { strokeColor, lineWidth } = config;

    for (let i = 0, len = coordinateCount; i < len; i += 1) {
        const coordinate = data[i].$;

        const currentCoordinate = [
            parseFloat(coordinate.lat),
            parseFloat(coordinate.lon),
        ];
        points.push(currentCoordinate);
    }

    const encodedPolyline = polyline.encode(points);

    return JSON.stringify([
        { points: encodedPolyline, strokeColor, lineWidth },
    ]);
};

exports.setAnnotations = function (hikeData) {
    const { coordinates } = hikeData;
    const data = coordinates.gpx.trk[0].trkseg[0].trkpt[0].$;
    const point = `${data.lat},${data.lon}`;

    return JSON.stringify([
        {
            point,
            color: config.strokeColor,
            markerStyle: 'img',
            imgIdx: 0,
        },
    ]);
};

exports.setImageArray = function () {
    return JSON.stringify([
        {
            url: config.logo.url,
            height: config.logo.height,
            width: config.logo.width,
        },
    ]);
};
