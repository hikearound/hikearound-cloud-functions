const { Expo } = require('expo-server-sdk');
const sentry = require('@sentry/node');
const admin = require('firebase-admin');
const { getServerTimestamp } = require('./helper');

const expo = new Expo();
const db = admin.firestore();

const getBadgeCount = function (userData) {
    if (userData.notifBadgeCount) {
        return userData.notifBadgeCount + 1;
    }
    return 1;
};

const writeBadgeCount = function (recipientUid, badgeCount) {
    return db
        .collection('users')
        .doc(recipientUid)
        .set({ notifBadgeCount: badgeCount }, { merge: true });
};

const getAndWriteBadgeCount = function (data, userData) {
    const { recipientUid } = data.notif.data;

    const badgeCount = getBadgeCount(userData);
    writeBadgeCount(recipientUid, badgeCount);

    return badgeCount;
};

const writeNotification = function (notificationData) {
    return db
        .collection('notifications')
        .doc()
        .set(notificationData, { merge: true });
};

const buildAndWriteNotification = function (data) {
    const { recipientUid } = data.notif.data;

    const notificationData = {
        createdOn: getServerTimestamp(),
        extraData: data.notif.data,
        type: data.type,
        hid: data.hid,
        isRead: false,
        recipientUid,
    };

    writeNotification(notificationData);
    return notificationData;
};

const buildTokenList = function (userData) {
    const pushTokens = [];

    if (userData.notificationToken) {
        if (!pushTokens.includes(userData.notificationToken)) {
            pushTokens.push(userData.notificationToken);
        }
    }

    return pushTokens;
};

const buildNotifications = function (data, userData, pushTokens) {
    const notifications = [];

    const notificationData = buildAndWriteNotification(data);
    const badgeCount = getAndWriteBadgeCount(data, userData);

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

const sendNotifications = async function (chunks) {
    const tickets = [];

    for (const chunk of chunks) {
        try {
            const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            tickets.push(...ticketChunk);
        } catch (e) {
            sentry.captureException(e);
        }
    }

    return tickets;
};

const chunkNotifications = async function (notifications) {
    const chunks = expo.chunkPushNotifications(notifications);
    return sendNotifications(chunks);
};

exports.send = async function (data, userData) {
    const pushTokens = buildTokenList(userData);
    const notifications = buildNotifications(data, userData, pushTokens);

    chunkNotifications(notifications);
};
