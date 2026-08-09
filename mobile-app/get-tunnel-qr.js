const http = require('http');
const QRCode = require('qrcode');

http.get('http://127.0.0.1:4040/api/tunnels', (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.tunnels && json.tunnels.length > 0) {
                const url = json.tunnels[0].public_url.replace('https://', 'exp://').replace('http://', 'exp://');
                const path = 'C:\\Users\\Monica\\.gemini\\antigravity-ide\\brain\\e1f1fd63-f96e-495b-8a68-fb5b80864641\\expo-tunnel-qr.png';
                QRCode.toFile(path, url, { width: 300, margin: 2, color: { dark: '#000000', light: '#ffffff' } }, (err) => {
                    if (err) throw err;
                    console.log('Generated tunnel QR for:', url);
                });
            } else {
                console.log('No tunnels found.');
            }
        } catch (e) {
            console.log('Error parsing JSON:', e.message);
        }
    });
}).on('error', (err) => console.log('Error:', err.message));
