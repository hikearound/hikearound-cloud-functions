const { Expo } = require('expo-server-sdk');
const sentry = require('@sentry/node');
const admin = require('firebase-admin');

const expo = new Expo();
const db = admin.firestore();

const pushTokens = [];
const notifications = [];
const tickets = [];
const receiptIds = [];

const buildTokenList = async function (uid) {
    const userSnapshot = await db.collection('users').doc(uid).get();

    const userData = userSnapshot.data();
    pushTokens.push(userData.notificationToken);
};

const buildNotification = async function (data) {
    for (const token of pushTokens) {
        if (Expo.isExpoPushToken(token)) {
            notifications.push({
                to: token,
                sound: 'default',
                title: data.title,
                body: data.body,
                badge: 1,
                priority: 'default',
                data: { hid: data.hid },
            });
        }
    }
};

const sendNotifications = async function () {
    const chunks = expo.chunkPushNotifications(notifications);

    (async () => {
        for (const chunk of chunks) {
            try {
                const ticketChunk = await expo.sendPushNotificationsAsync(
                    chunk,
                );
                tickets.push(...ticketChunk);
            } catch (e) {
                sentry.captureException(e);
            }
        }
    })();
};

const buildReceiptList = async function () {
    for (const ticket of tickets) {
        if (ticket.id) {
            receiptIds.push(ticket.id);
        }
    }
};

const checkReciepts = async function () {
    const receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
    (async () => {
        for (const chunk of receiptIdChunks) {
            try {
                const receipts = await expo.getPushNotificationReceiptsAsync(
                    chunk,
                );
                for (const receiptId in receipts) {
                    const { status, message, details } = receipts[receiptId];
                    if (status === 'error') {
                        sentry.captureMessage(
                            `Error code '${details.error}': ${message}`,
                        );
                    }
                }
            } catch (e) {
                sentry.captureException(e);
            }
        }
    })();
};

exports.send = async function (data) {
    await buildTokenList(data.uid);
    await buildNotification(data);
    await sendNotifications();
    await buildReceiptList();
    await checkReciepts();

    return true;
};
