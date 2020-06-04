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
    if (pointCount >= 360) {
        return 4;
    }
    return 3;
};
