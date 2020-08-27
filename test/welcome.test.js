const fs = require('fs');
const { buildTemplate } = require('../utils/email');

exports.buildEmail = async function () {
    const type = 'welcome';

    const data = {
        name: 'Pat',
        uid: '1',
        token: '1',
    };

    data.type = type;
    data.includeTypeUnsubscribe = false;

    const email = buildTemplate(data, type);
    fs.writeFile('./test/output/email.html', email, function () {});
};
