// Express app setup

const express = require('express')
const authRoutes = require('./routes/auth.routes');

app.use(express.json());
const app = express()


app.use('/auth', authRoutes)

module.exports = app