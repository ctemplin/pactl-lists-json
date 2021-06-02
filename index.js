const { exec } = require('child_process');

function unquote(s) {
    return s.replace(/^[\"\']/, '').replace(/[\"\']$/, '')
}

function tokenize(s) {
    function splitLine(l) {
        var hsi = l.indexOf('#')
        var sci = l.indexOf(':')
        var eqi = l.indexOf('=')
        hsi = hsi > -1 ? hsi : Number.MAX_SAFE_INTEGER
        sci = sci > -1 ? sci : Number.MAX_SAFE_INTEGER
        eqi = eqi > -1 ? eqi : Number.MAX_SAFE_INTEGER
        var tokens
        if (hsi < sci) {
            tokens = l.split('#', 2)
        }
        else if (sci < eqi) {
            tokens = l.split(':', 2)
        } else {
            tokens = l.split('=', 2)
        }
        tokens = tokens.map(t => unquote(t.trim()))
        return tokens
    }
    var lineArr = s.split('\n')
    var o = {}
    lineArr = lineArr.map(
        function(l){
            var kv = splitLine(l)
            var key = kv[0]
            if (key)
                o[key] = kv[1]
        }
    )
    return o
}

async function getInputs(){
    return new Promise((resolve, reject) => {
        try {
            exec('pactl list sink-inputs', {silent: true}, (error, stdout, stderr) => {
                if (stderr) {
                    reject(stderr)
                }
                inputArr = []
                if (stdout.length) {
                    var inputBlocks = stdout.split('\n\n')
                    inputBlocks.map(function(block){inputArr.push(tokenize(block))})
                }
                resolve(inputArr)
            })
        } catch(error) {
            reject(error)
        }
    });
}

async function getSinks(){
    return new Promise((resolve, reject) => {
        try {
            exec('pactl list sinks', {silent: true}, (error, stdout, stderr) => {
                if (stderr) {
                    reject(stderr)
                }
                var sinkBlocks = stdout.split('\n\n')
                sinkArr = []
                sinkBlocks.map(function(block){sinkArr.push(tokenize(block))})
                resolve(sinkArr)
            })

        } catch(error) {
            reject(error)
        }
    });
}

module.exports = {
    getInputs,
    getSinks
};
