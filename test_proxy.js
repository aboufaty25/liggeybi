const express = require('express');
const app = express();
app.use("/uploads", (req, res) => {
  console.log("req.url is:", req.url);
  console.log("req.originalUrl is:", req.originalUrl);
  res.send("ok");
});
const server = app.listen(3002, () => {
  fetch('http://localhost:3002/uploads/test.pdf')
    .then(() => server.close());
});
