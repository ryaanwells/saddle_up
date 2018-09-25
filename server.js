const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;

// API calls
app.get('/raml', (req, res) => {
    res.sendFile(path.join(__dirname, 'api.raml'));
});

if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  app.use(static(path.join(__dirname, 'build')));

  // Handle React routing, return all requests to React app
  app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

app.listen(port, () => console.log(`Listening on port ${port}`));