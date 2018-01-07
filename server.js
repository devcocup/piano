const express = require('express');
const serveStatic = require('serve-static');
const app = express();

app.use(express.static('dist'));
app.listen(80, () => console.log('App running on port 80'));