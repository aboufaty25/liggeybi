import http from 'http';

http.get('http://127.0.0.1:3000', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Body snippet:', data.substring(0, 500));
  });
}).on('error', err => {
  console.error('Error fetching:', err.message);
});
