exports.translations = {
    common: {
        hikes: 'Hikes',
        continue: 'Continue Reading',
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
                "Hi {{name}},<br>Here are some hikes we recently added near {{location}} that we think you'll enjoy.",
            body:
                '<a href="https://www.tryhikearound.com/hike/{{hid}}">{{name}}</a> is a hike located in {{city}}, {{state}}. It\'s a {{distance}} mile {{route}} with a net elevation gain of {{elevation}} feet.<p>{{description}} <a href="https://www.tryhikearound.com/hike/{{hid}}">Continue Reading</a></p>',
            cta: 'View Hike',
        },
    },
};
