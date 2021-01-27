exports.translations = {
    common: {
        hikes: 'Hikes',
        continue: 'Continue Reading',
        description: 'Description',
        map: 'Trail Map',
        gallery: 'Gallery',
    },
    notif: {
        digest: {
            title: 'Check out this weeks best hikes',
            body:
                'Get ready for the weekend by checking out {{name}} and other hikes we think you might like.',
        },
    },
    email: {
        common: {
            footer: {
                intro:
                    'This email was sent by Hikearound (542 Brannan St, San Francisco, CA 94107). ',
                type:
                    'To stop receiving {{type}} emails, <a class="text-link" href="{{url}}">Click here</a>. ',
                global:
                    'To stop receiving this and all other emails, <a class="text-link" href="{{url}}">Unsubscribe</a>.',
            },
        },
        digest: {
            subject:
                'Get ready for the weekend by checking out {{name}} and other hikes we think you might like.',
            intro:
                'Hi {{name}},<br>We recently added some hikes near {{location}} and this is one we think you might enjoy.',
            body:
                '<a href="https://www.tryhikearound.com/hike/{{hid}}">{{name}}</a> is a hike located in {{city}}, {{state}}. It\'s a {{distance}} mile {{route}} with a net elevation gain of {{elevation}} feet.<p>{{description}} <a href="https://www.tryhikearound.com/hike/{{hid}}">Continue Reading</a></p>',
            cta: 'View Hike',
        },
        reset: {
            subject: 'Reset your Hikearound password.',
            body:
                'Hi {{name}},<br>Someone recently requested to change the password on your Hikearound account. If this was you, you can reset your password by clicking the button below.<p>If you no longer want to change your password, or if you didn\'t request this, please ignore and delete this message.<div class="signature">Thanks,</div>The Hikearound Team',
            cta: 'Reset Password',
        },
        welcome: {
            subject: '{{name}}, welcome to Hikearound!',
            body:
                'Hi {{name}},<br>We\'re stoked you decided to join Hikearound! Please verify your email address so that each week we can send you the best new hikes we think you\'ll enjoy.<div class="signature">Thanks,</div>The Hikearound Team',
            cta: 'Confirm your email address',
        },
    },
};
