const admin = require('firebase-admin');
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
    const token = await auth.createCustomToken(user.uid);

    const data = {
        name: getFirstName(userData.name),
        emailToAddress: user.email,
        emailSubject: `Reset your Hikearound password.`,
    };

    data.token = token;
    data.uid = user.uid;
    data.emailtype = type;
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
