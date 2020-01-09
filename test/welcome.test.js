const firebase = require('@firebase/testing');
const fs = require('fs');
const welcomeEmail = require('../emails/welcome');
// const map = require('../functions/map');

const projectId = 'hikearound';
const rules = fs.readFileSync('firestore.rules', 'utf8');

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

describe('Hikearound', () => {
    it('...should build and send a welcome email to new users', async () => {
        const senderData = {
            name: 'Hikearound',
            email: 'no-reply@tryhikearound.com',
        };

        const user = {
            name: 'Pat',
            token: '',
            email: 'dugan.pat@gmail.com',
        };

        welcomeEmail.handler(senderData, user, undefined);
    });

    it('...should create a document in the user collection for new users', async () => {
        const db = authedApp({ uid: '1' });
        await firebase.assertSucceeds(
            db
                .collection('users')
                .doc('pat')
                .set({
                    name: 'Pat',
                }),
        );
    });
});
