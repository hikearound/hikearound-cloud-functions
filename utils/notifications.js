const { Expo } = require('expo-server-sdk');
const sentry = require('@sentry/node');
const admin = require('firebase-admin');
const { getServerTimestamp } = require('./helper');

const expo = new Expo();
const db = admin.firestore();

const buildAndWriteNotification = async function (data) {
    const { recipientUid } = data.notif.data;

    const notificationData = {
        createdOn: getServerTimestamp(),
        extraData: data.notif.data,
        type: data.type,
        hid: data.hid,
        isRead: false,
        recipientUid,
    };

    await db
        .collection('notifications')
        .doc()
        .set(notificationData, { merge: true });

    return notificationData;
};

const getBadgeCount = async function (data) {
    const { recipientUid } = data.notif.data;

    const notificationsRef = db
        .collection('notifications')
        .where('recipientUid', '==', recipientUid)
        .orderBy('createdOn', 'desc');

    const querySnapshot = await notificationsRef.get();
    return querySnapshot.size;
};

const buildTokenList = async function (uid) {
    const pushTokens = [];

    const userSnapshot = await db.collection('users').doc(uid).get();
    const userData = userSnapshot.data();

    if (userData.notificationToken) {
        if (!pushTokens.includes(userData.notificationToken)) {
            pushTokens.push(userData.notificationToken);
        }
    }

    return pushTokens;
};

const buildNotifications = async function (data, pushTokens) {
    const notifications = [];

    const notificationData = await buildAndWriteNotification(data);
    const badgeCount = await getBadgeCount(data);

    for (const token of pushTokens) {
        if (Expo.isExpoPushToken(token)) {
            notifications.push({
                to: token,
                sound: 'default',
                title: data.notif.title,
                body: data.notif.body,
                priority: 'default',
                badge: badgeCount,
                data: notificationData,
            });
        }
    }

    return notifications;
};

const sendNotifications = async function (notifications) {
    const tickets = [];
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

    return tickets;
};

const buildReceiptList = async function (tickets) {
    const receiptIds = [];
    for (const ticket of tickets) {
        if (ticket.id) {
            receiptIds.push(ticket.id);
        }
    }
    return receiptIds;
};

const checkReciepts = async function (receiptIds) {
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
    const pushTokens = await buildTokenList(data.uid);
    const notifications = await buildNotifications(data, pushTokens);
    const tickets = await sendNotifications(notifications);
    const receiptIds = await buildReceiptList(tickets);

    await checkReciepts(receiptIds);
    return true;
};
