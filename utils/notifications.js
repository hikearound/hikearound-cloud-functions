const { Expo } = require('expo-server-sdk');
const sentry = require('@sentry/node');
const admin = require('firebase-admin');
const { getServerTimestamp } = require('./helper');

const expo = new Expo();
const db = admin.firestore();

const getBadgeCount = async function (userData) {
    if (userData.notifBadgeCount) {
        return userData.notifBadgeCount;
    }

    return 0;
};

const getAndUpdateBadgeCount = async function (data, userData) {
    const { recipientUid } = data.notif.data;

    let badgeCount = await getBadgeCount(userData);
    badgeCount += 1;

    await db
        .collection('users')
        .doc(recipientUid)
        .set({ notifBadgeCount: badgeCount }, { merge: true });

    return badgeCount;
};

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

    db.collection('notifications').doc().set(notificationData, { merge: true });
    return notificationData;
};

const buildTokenList = async function (userData) {
    const pushTokens = [];

    if (userData.notificationToken) {
        if (!pushTokens.includes(userData.notificationToken)) {
            pushTokens.push(userData.notificationToken);
        }
    }

    return pushTokens;
};

const buildNotifications = async function (data, userData, pushTokens) {
    const notifications = [];

    const notificationData = await buildAndWriteNotification(data);
    const badgeCount = await getAndUpdateBadgeCount(data, userData);

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

exports.send = async function (data, userData) {
    const pushTokens = await buildTokenList(userData);
    const notifications = await buildNotifications(data, userData, pushTokens);
    await sendNotifications(notifications);
};
