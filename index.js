const helmet = require('helmet');
const express = require('express');
const cors = require('cors');
const fileRoute = require('./routes/file');
require('./db/db');

const app = express();

app.use(helmet());

app.use(cors({
  origin:["http://localhost:3000","https://research-eden.onrender.com","https://researcheden.org"],
}));
app.use(fileRoute);

app.listen(3030, () => {
  console.log('server started on port 3030');
});