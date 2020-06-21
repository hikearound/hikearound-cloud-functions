const { config } = require('../constants/map');

exports.setCenter = function (hikeData) {
    const hikeMetaData = hikeData.gpx.metadata[0].bounds[0].$;
    const { maxlat, minlat, minlon, maxlon } = hikeMetaData;

    const lat = (parseFloat(maxlat) + parseFloat(minlat)) / 2;
    const lng = (parseFloat(maxlon) + parseFloat(minlon)) / 2;

    return `${lat},${lng}`;
};

exports.setSpan = function (hikeData) {
    const hikeMetaData = hikeData.gpx.metadata[0].bounds[0].$;
    const { maxlat, minlat, minlon, maxlon } = hikeMetaData;

    return [maxlat - minlat + config.latModifier, maxlon - minlon];
};

exports.getSkipCoord = function (pointCount) {
    let skipCoord = 3;

    if (pointCount >= 360 && pointCount < 450) {
        skipCoord = 4;
    } else if (pointCount >= 450) {
        skipCoord = 5;
    }

    return skipCoord;
};

exports.setOverlay = function (hikeData) {
    const points = [];

    const pointCount = hikeData.gpx.trk[0].trkseg[0].trkpt.length;
    const { strokeColor, lineWidth } = config;
    const skipCoord = exports.getSkipCoord(pointCount);

    for (let i = 0, len = pointCount; i < len; i += 1) {
        if (i % skipCoord === 0) {
            const coordinate = hikeData.gpx.trk[0].trkseg[0].trkpt[i].$;
            points.push(`${coordinate.lat},${coordinate.lon}`);
        }
    }

    const coordinate = hikeData.gpx.trk[0].trkseg[0].trkpt[pointCount - 1].$;
    points.push(`${coordinate.lat},${coordinate.lon}`);

    return JSON.stringify([{ points, strokeColor, lineWidth }]);
};
