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

exports.getSkipCoord = function (pointCount) {
    if (pointCount <= 120) {
        return 1;
    }

    return Math.round(pointCount / 120) + 1;
};

exports.removeDuplicateCoordinates = function (coordinates) {
    const cleanCoordinates = [];
    const existingCoords = [];

    const data = coordinates.gpx.trk[0].trkseg[0].trkpt;
    const coordinateCount = data.length;

    for (let i = 0, len = coordinateCount; i < len; i += 1) {
        const coordinate = data[i].$;
        const exists = existingCoords.includes(coordinate.lat);
        const currentCoordinate = [`${coordinate.lat},${coordinate.lon}`];

        if (!exists) {
            cleanCoordinates.push(currentCoordinate.toString());
            existingCoords.push(coordinate.lat);
        }
    }

    return cleanCoordinates;
};

exports.setOverlay = function (hikeData) {
    const points = [];

    const { coordinates, route } = hikeData;
    const cleanCoordinates = exports.removeDuplicateCoordinates(coordinates);
    const coordinateCount = cleanCoordinates.length;
    const { strokeColor, lineWidth } = config;
    const skipCoord = exports.getSkipCoord(coordinateCount);

    for (let i = 0, len = coordinateCount; i < len; i += 1) {
        if (i % skipCoord === 0) {
            const coordinate = cleanCoordinates[i];
            points.push(coordinate);
        }
    }

    if (route === 'Loop') {
        points.push(cleanCoordinates[0]);
    }

    return JSON.stringify([{ points, strokeColor, lineWidth }]);
};

exports.setAnnotations = function (overlays) {
    const point = JSON.parse(overlays)[0].points[0];

    return JSON.stringify([
        {
            point,
            color: config.strokeColor,
            markerStyle: 'balloon',
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
