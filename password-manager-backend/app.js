require('dotenv').config()
const express = require('express')
const bodyParser= require('body-parser')
const app = express()


app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

app.listen(3000, function() {
    console.log('Running on http://localhost:3000')
})

require('./config/routes.js')(app)