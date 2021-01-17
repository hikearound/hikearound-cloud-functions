exports.translations = {
    common: {
        hikes: 'Caminatas',
        continue: 'Sigue leyendo',
    },
    notif: {
        digest: {
            title: 'Mira las mejores caminatas de esta semana',
            body:
                'Prepárate para el fin de semana visitando {{name}} y otras caminatas que creemos que te pueden gustar.',
        },
    },
    email: {
        common: {
            footer: {
                intro:
                    'Este correo electrónico fue enviado por Hikearound (542 Brannan St, San Francisco, CA 94107). ',
                type:
                    'Para dejar de recibir {{type}} correos electrónicos, <a class="text-link" href="{{url}}">Haga clic aquí</a>. ',
                global:
                    'Para dejar de recibir este y todos los demás correos electrónicos, <a class="text-link" href="{{url}}">Anule la suscripción</a>.',
            },
        },
        digest: {
            subject:
                'Prepárate para el fin de semana visitando {{name}} y otras caminatas que creemos que te pueden gustar.',
            intro:
                'Hola {{name}},<br> Aquí hay algunas caminatas que agregamos recientemente cerca de {{location}} que creemos que disfrutarás.',
            body:
                '<a href="https://www.tryhikearound.com/hike/{{hid}}">{{name}}</a> es una caminata ubicada en {{city}}, {{state}}. Es una {{distance}} milla {{route}} con una ganancia de elevación neta de {{elevation}} pies.',
            cta: 'Ver caminata',
        },
        reset: {
            subject: 'Restablece tu contraseña de Hikearound.',
            body:
                'Hola {{name}},<br>Alguien recientemente solicitó cambiar la contraseña de tu cuenta de Hikearound. Si era usted, puede restablecer su contraseña haciendo clic en el botón a continuación.<p>Si ya no desea cambiar su contraseña, o si no solicitó esto, ignore y elimine este mensaje.<div class="signature">Gracias,</div>El equipo de Hikearound',
            cta: 'Restablecer la contraseña',
        },
        welcome: {
            subject: '{{name}}, ¡bienvenido a Hikearound!',
            body:
                'Hola {{name}},<br>¡Nos alegra que hayas decidido unirte a Hikearound! Verifique su dirección de correo electrónico para que cada semana podamos enviarle las mejores caminatas nuevas que creemos que disfrutará.<div class="signature">Gracias,</div>El equipo de Hikearound',
            cta: 'Confirme su dirección de correo electrónico',
        },
    },
};
