const i18n = require('i18n-js');
const en = require('../translations/en');
const es = require('../translations/es');

exports.initializeLang = function (lang) {
    i18n.translations = {
        en: en.translations,
        es: es.translations,
    };

    i18n.locale = lang;
    i18n.fallbacks = true;

    return i18n;
};
