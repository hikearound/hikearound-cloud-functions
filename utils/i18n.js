const i18n = require('i18n-js');
const en = require('@translations/en');
const es = require('@translations/es');

exports.translate = function (userData) {
    i18n.translations = {
        en: en.translations,
        es: es.translations,
    };

    i18n.locale = userData.lang;
    i18n.fallbacks = true;

    return i18n.t;
};
