const firebase = require('@firebase/testing');
const fs = require('fs');
const welcome = require('../emails/welcome');

const projectId = 'hikearound';
const rules = fs.readFileSync('firestore.rules', 'utf8');

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

describe('When a user creates an account, Hikearound...', () => {
    it('...should build and send a welcome email with a verification link', async () => {
        const testData = {
            name: 'Pat',
            uid: '1',
            token: '1',
            email: 'dugan.pat@gmail.com',
        };

        const db = authedApp({ uid: '1' });
        const { uid } = testData;

        welcome.welcomeEmail(uid, db, sgMail, testData);
    });

    it('...should create a document in the user collection', async () => {
        const db = authedApp({ uid: '1' });
        await firebase.assertSucceeds(
            db
                .collection('users')
                .doc('pat')
                .set({ name: 'Pat' }),
        );
    });
});
