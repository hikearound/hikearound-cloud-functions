const { compile } = require('handlebars');
const mjml2html = require('mjml');
const fs = require('fs');
const path = require('path');
const { encode } = require('js-base64');
const { unsubscribe } = require('../constants/email');
const { senderData } = require('../constants/email');

exports.getUnsubscribeUrl = function (uid, type) {
    const token = encode(uid);
    return `${unsubscribe.url}?type=${type}&token=${token}`;
};

exports.getUnsubscribeHeader = function (uid, type) {
    const unsubscribeUrl = exports.getUnsubscribeUrl(uid, type);
    return `<mailto:${unsubscribe.email}?subject=uid:${uid},type:${type}>, <${unsubscribeUrl}>`;
};

exports.buildTemplate = function (data, type) {
    const { uid, t } = data;

    let mjmlTemplate = fs.readFileSync(
        `${__dirname}/../templates/base.mjml`,
        'utf8',
    );

    data.unsubscribe = {
        intro: t('email.common.footer.intro'),
        type: t('email.common.footer.type', {
            type,
            url: exports.getUnsubscribeUrl(uid, type),
        }),
        global: t('email.common.footer.global', {
            url: exports.getUnsubscribeUrl(uid, 'global'),
        }),
    };

    mjmlTemplate = compile(mjmlTemplate);
    mjmlTemplate = mjmlTemplate({ type });

    let html = mjml2html(mjmlTemplate, {
        filePath: path.join(__dirname, '../templates/components'),
    });

    html = compile(html.html);
    html = html(data);

    return html;
};

exports.buildEmail = async function (data, type) {
    const html = exports.buildTemplate(data, type);
    const unsubscribeHeader = exports.getUnsubscribeHeader(data.uid, type);

    return {
        to: [data.email.toAddress],
        from: senderData.nameAndAddress,
        subject: data.email.subject,
        'o:tag': type,
        'h:List-Unsubscribe': unsubscribeHeader,
        html,
    };
};
