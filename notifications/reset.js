const admin = require('firebase-admin');
const { encode } = require('js-base64');
const { initializeMailgun } = require('../utils/config');
const { buildEmail } = require('../utils/email');
const { getUserData } = require('../utils/user');
const { getFirstName } = require('../utils/helper');

const type = 'reset';
const auth = admin.auth();

const buildData = async function (userEmail) {
    let user;

    try {
        user = await auth.getUserByEmail(userEmail);
    } catch (e) {
        return false;
    }

    const userData = await getUserData(user.uid);

    const data = {
        name: getFirstName(userData.name),
        emailToAddress: user.email,
        emailSubject: `Reset your Hikearound password.`,
        token: encode(user.uid),
    };

    data.uid = user.uid;
    data.includeTypeUnsubscribe = false;

    return data;
};

exports.send = async function (userEmail) {
    const data = await buildData(userEmail);

    if (data) {
        const email = await buildEmail(data, type);
        const mg = initializeMailgun();
        return mg.messages().send(email);
    }

    return true;
};
