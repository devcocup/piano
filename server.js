const express = require('express');
const serveStatic = require('serve-static');
const app = express();
const port = 8666;

app.use(express.static('dist'));
app.listen(port, () => console.log(`App running on port ${port}`));