const FROM_EMAIL = 'noreply@hikearound.com';
const TEMPLATE_ID = 'd-3541f72c3b33499bbd639a731bb72f94';

exports.handler = function(user, sgMail) {
    const msg = {
        to: user.email,
        from: FROM_EMAIL,
        templateId: TEMPLATE_ID,
        dynamic_template_data: {
            subject: 'Welcome to Hikearound',
            name: user.displayName,
        },
    };
    sgMail.send(msg);
};
