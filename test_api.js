const http = require('http');

const options = {
  hostname: '127.0.0.1',
  port: 5000,
  path: '/api/organizations',
  method: 'GET'
};

const req = http.request(options, (res) => {
    let data = '';
    console.log('Status Code:', res.statusCode);
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log('Body:', data);
    });
});

req.on('error', (err) => {
    console.error('Error:', err.message);
});

req.end();
