const https = require('http');

http.get('http://localhost:5001/api/developers/699ca273056bcad8dfaf7ac0/profile', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(JSON.parse(data));
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
