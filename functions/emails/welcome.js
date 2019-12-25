const TEMPLATE_ID = 'd-7d3af52d50034393ba95ce374003dd6c';

exports.handler = function(senderData, user, sgMail) {
    const msg = {
        to: user.email,
        from: {
            name: senderData.name,
            email: senderData.email,
        },
        templateId: TEMPLATE_ID,
        dynamic_template_data: {
            subject: `${user.name}, welcome to Hikearound!`,
            name: user.name,
            token: user.token,
        },
    };
    return sgMail.send(msg);
};
