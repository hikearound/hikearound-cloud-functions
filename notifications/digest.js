const { Expo } = require('expo-server-sdk');
const Sentry = require('@sentry/node');
const admin = require('firebase-admin');

const expo = new Expo();
const db = admin.firestore();

const pushTokens = [];
const notifications = [];

const buildTokenList = async function(uid) {
    const userSnapshot = await db
        .collection('users')
        .doc(uid)
        .get();

    const userData = userSnapshot.data();
    pushTokens.push(userData.notificationToken);
};

const buildNotification = async function(data) {
    for (const token of pushTokens) {
        notifications.push({
            to: token,
            sound: 'default',
            body: data.subject,
            data: { hid: data.hid },
        });
    }
};

const sendNotification = async function() {
    const chunks = expo.chunkPushNotifications(notifications);
    const tickets = [];

    (async () => {
        for (const chunk of chunks) {
            try {
                const ticketChunk = await expo.sendPushNotificationsAsync(
                    chunk,
                );
                tickets.push(...ticketChunk);
            } catch (error) {
                Sentry.captureException(error);
            }
        }
    })();
};

exports.digestNotification = async function(uid, data) {
    await buildTokenList(uid);
    await buildNotification(data);
    await sendNotification();

    return true;
};
