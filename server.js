const express = require('express');
const serveStatic = require('serve-static');
const path = require('path');
const app = express();

app.set('port', process.env.PORT || 3000);

app.use(express.static(path.join(__dirname, 'dist')));
app.listen(app.get('port'), () => console.log(`App running on port ${app.get('port')}`));