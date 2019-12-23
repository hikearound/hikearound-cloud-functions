const TEMPLATE_ID = 'd-3541f72c3b33499bbd639a731bb72f94';
const SUBJECT = 'Welcome to Hikearound';

exports.handler = function(senderData, user, sgMail) {
    const msg = {
        to: user.email,
        from: {
            name: senderData.name,
            email: senderData.email,
        },
        templateId: TEMPLATE_ID,
        dynamic_template_data: {
            subject: SUBJECT,
            name: user.displayName,
        },
    };
    return sgMail.send(msg);
};
