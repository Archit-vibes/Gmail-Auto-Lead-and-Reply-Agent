// Entry point for server

const express = require('express');
const app = require('./app');
const env = require('dotenv').config();

app.listen(8000 , () =>{
    console.log('server is lisening on port 8000');
})