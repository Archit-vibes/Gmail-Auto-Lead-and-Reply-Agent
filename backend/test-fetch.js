const express = require('express');
const { fetchEmails } = require('./src/controllers/email.controller');

const req = {
    params: { userId: "10" },
    session: {}
};
const res = {
    status: (code) => { console.log('Status:', code); return res; },
    json: (data) => { console.log('JSON Length:', data.length); },
    send: (msg) => { console.log('Send:', msg); }
};

async function run() {
    console.log("Running fetchEmails test");
    await fetchEmails(req, res);
    console.log("Test finished successfully");
}
run();
