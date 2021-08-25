const axios = require('axios');

let target,
    method,
    parallel = 4,
    payload,
    active_calls = 0,
    hit = 0,
    not_hit = 0,
    interval = null,
    last_err = null,
    code_500 = false,
    startDate,
    responseTimes = []

const WAIT_INTERVAL = 300;


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
    axios[method](url)
        .then(res => {
            hit++;
            responseTimes.push(new Date().getTime() - start.getTime());
        })
        .catch(err => {
            not_hit++;
            try {
                const code = err.response.status;
                if(code){
                    if(code >= 500){
                        code_500++;
                    }
                }
                last_err = err.message;
            } catch (err) {
            }
        })
        .finally(() => {
            active_calls--;
        })
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
    interval = setInterval(() => {
        mainLoop()
    }, WAIT_INTERVAL)
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
    return {
        target, method, parallel, payload, active_calls,
        success: hit, failure: not_hit, running: Boolean(interval),
        down_with_500: code_500,
        response_rate,
        min_response:Math.min(...responseTimes),
        max_response:Math.max(...responseTimes),
        avg_response:(responseTimes.reduce((acc,val) => acc + val , 0) / responseTimes.length).toFixed(0),
    };
}
