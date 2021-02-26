const fs = require('fs');
const { buildTemplate } = require('../utils/email');

exports.buildEmail = async function () {
    const type = 'digest';

    const data = {
        name: 'Pat',
        hid: 'zvXj5WRBdxrlRTLm65SD',
        hikeName: 'Meyers Lane',
        hikeLocation: 'Marin, CA',
        hikeDistance: '4.3',
        hikeElevation: '1043',
        hikeRoute: 'Loop',
    };

    data.hikeDescription =
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum erat arcu, posuere ac varius vel, viverra et lorem. Maecenas fringilla dignissim lobortis. Ut pharetra scelerisque eros, vitae pulvinar nisi pharetra quis.\n\nAliquam suscipit nec purus sit amet eleifend. Quisque quis turpis eget elit varius iaculis. Vivamus fermentum in quam eget vulputate. Aenean faucibus, ante nec fringilla faucibus, nunc ligula varius erat, non consequat elit diam vitae erat.';
    data.hikeMapUrl =
        'https://firebasestorage.googleapis.com/v0/b/hikearound-14dad.appspot.com/o/images%2Fmaps%2FzvXj5WRBdxrlRTLm65SD.png?alt=media&token=aa122190-342e-431e-a342-ffa501dc0e3b';

    data.type = type;
    data.includeTypeUnsubscribe = true;

    const email = buildTemplate(data, type);
    fs.writeFile('./test/output/email.html', email, () => {});
};
