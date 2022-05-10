const express = require('express');
const app = express();

require('dotenv').config();
const port = process.env.PORT;
const host = process.env.HOST

const cors = require('cors')
const corsOptions = {
  origin: process.env.BASE_URL
}
app.use(cors(corsOptions));

const bodyParser = require('body-parser');

let router = require('./src/router/');
const db = require('./src/models');
db.sequelize.sync({force: true,  logging: false}).then(() => {
  // console.log('Drop and Resync with { force: true }');  
}); 

const swaggerUi = require('swagger-ui-express');
swaggerDocument = require('./swagger.json');

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', router);

app.use(
  '/api-docs',
  swaggerUi.serve, 
  swaggerUi.setup(swaggerDocument)
);

app.listen(port, () => {
  //  console.log("App listening at http://%s:%s", host, port); 
});

module.exports = app;