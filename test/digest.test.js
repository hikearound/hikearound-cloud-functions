const firebase = require('@firebase/testing');
const fs = require('fs');
const digest = require('../emails/digest');

const projectId = 'hikearound';
const rules = fs.readFileSync('firestore.rules', 'utf8');

const admin = undefined;
const sgMail = undefined;

function authedApp(auth) {
    return firebase.initializeTestApp({ projectId, auth }).firestore();
}

beforeEach(async () => {
    await firebase.clearFirestoreData({ projectId });
});

before(async () => {
    await firebase.loadFirestoreRules({ projectId, rules });
});

after(async () => {
    await Promise.all(firebase.apps().map((app) => app.delete()));
});

describe('Every Friday at 9:00AM PST, Hikearound...', async () => {
    it('...should send a digest email to all users with a verified email address', async () => {
        const testData = {
            name: 'Pat',
            email: 'dugan.pat@gmail.com',
            hid: 'zvXj5WRBdxrlRTLm65SD',
            hikeName: 'Meyers Lane',
            hikeLocation: 'Marin, CA',
            hikeDistance: '4.3',
            hikeElevation: '1043',
            hikeRoute: 'Loop',
        };

        testData.hikeDescription =
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum erat arcu, posuere ac varius vel, viverra et lorem. Maecenas fringilla dignissim lobortis. Ut pharetra scelerisque eros, vitae pulvinar nisi pharetra quis.\n\nAliquam suscipit nec purus sit amet eleifend. Quisque quis turpis eget elit varius iaculis. Vivamus fermentum in quam eget vulputate. Aenean faucibus, ante nec fringilla faucibus, nunc ligula varius erat, non consequat elit diam vitae erat.';

        testData.hikeMapUrl =
            'https://firebasestorage.googleapis.com/v0/b/hikearound-14dad.appspot.com/o/images%2Fmaps%2FzvXj5WRBdxrlRTLm65SD.png?alt=media&token=aa122190-342e-431e-a342-ffa501dc0e3b';

        const db = authedApp({ uid: '1' });

        digest.digestEmail(admin, db, sgMail, testData);
    });
});
