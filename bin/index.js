#!/usr/bin/env node
const startServer = require('../src/server');
const lib = require('../src/lib/ddos');

const args = process.argv.slice(2);
const [command, ...optionsList] = args;
const options = {};
for (let i = 0; i < optionsList.length; i++) {
    const it = optionsList[i];
    const next = optionsList[i + 1];
    if (it && it.startsWith('-')) {
        const name = it.replace('-', '');
        if (next && !next.startsWith('-')) {
            options[name] = next;
            i++;
        } else {
            options[name] = true;
        }
    }
}


if (!command || ['--help', '-h', 'help'].includes(command)) {
    console.log(`
    Usage: hiter COMMAND [arguments]...
    
    Commands:
    web                             start the web server
       [-port 8080]                 listening port
       [-host 127.0.0.1]            address to bind       
       [-noAuth]                    disable basic authentication
       [-username]                  username for authentication
       [-password]                  password for authentication
       
    start                           start stress test
        -target url                 example https://hostname.xyz/search?q=*
       [-concurrent 8]              cuncurrent requests number
       [-method GET]                GET or SET          
       [-payload {"foo" : "bar"}]   
    `);

    return 0;
}

const commands = {
    web() {
        const {port, host, noAuth, username, password} = options;
        startServer({port, host, noAuth, username, password})
            .catch(err => {
                console.error(err);
            })
    },
    start() {
        let {target, concurrent, method, payload} = options;
        if (payload) {
            try {
                payload = JSON.parse(payload)
            } catch (e) {
                console.error(e);
            }
        }
        lib.setStuff(target, concurrent, method, payload);
        lib.startAttack();
        setInterval(function () {
            lib.printStatsInConsole();
        },60 * 4);
    }
}
if (commands[command] && typeof commands[command] === "function") {
    commands[command]();
}
