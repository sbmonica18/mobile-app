const QRCode = require('qrcode');
const path = 'C:\\Users\\Monica\\.gemini\\antigravity-ide\\brain\\e1f1fd63-f96e-495b-8a68-fb5b80864641\\expo-qr.png';
QRCode.toFile(path, 'exp://192.168.1.18:8081', {
  width: 300,
  margin: 2,
  color: {
    dark: '#000000',
    light: '#ffffff'
  }
}, function (err) {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log('QR Code generated at', path);
});
