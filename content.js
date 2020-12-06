function getLocalActivationValue(cb) {
    chrome.storage.local.get("buttonActive", cb);
}

function saveCache(cb) {
    chrome.storage.local.get("cachedPages", function(items) {
        let response = items.cachedPages
        if(response && response.length >= 1) {

            const site = window.location.hostname + ' - ' + document.title

            if(isWebPageUnique(response, site)) {
                response.push({
                    site,
                    data: collectCache()
                })
                chrome.storage.local.set({ "cachedPages":  response}, cb);
            }
        } else {
            chrome.storage.local.set({ "cachedPages":  [{
                site: window.location.hostname + ' - ' + document.title,
                data: collectCache()
            }]}, cb); 
        }
    })
}

function isWebPageUnique(data, site) {
    let isUnqiue = true

    // check if site is already in data
    for(let x = 0; x < data.length; x++) {
        if(data[x].site.includes(site)) {
            isUnqiue = false
            break;
        }
    }

    return isUnqiue
}

function getAllCache() {
    chrome.storage.local.get("cachedPages", function(items) {
        console.log(items.cachedPages)
    })
}

function clearCache() {
    chrome.storage.local.set({ "cachedPages": [] });
}

getLocalActivationValue(function(items) {
    response = items.buttonActive
    if (response) {
        window.addEventListener('load', function() {
            if (document.body) {
                getSetting("colorReduction", function(items) {
                    let response = items.colorReduction
                    response ? document.body.classList.add('__blackhole__') : null
                })
            }
            // calculate execution time
            let timebefore = Date.now()
            let sizeBefore = getDomSize()
            cleanJS()
            cleanIframes()
            let timeAfter = Date.now()
            let sizeAfter = getDomSize()
            log(`Successfully cleaned DOM in ${(timeAfter - timebefore) / 1000}s`)
            log(`Size before: ${bytesToSize(sizeBefore)}`)
            log(`Size after: ${bytesToSize(sizeAfter)} saved ${Math.floor(100 - ((sizeAfter / sizeBefore) * 100))}%`)
            // check local storage
            getSetting("collectCache", function(items) {
                let response = items.collectCache
                if (response) {
                    saveCache(function() {
                        log(`Successfully Saved Cached! ${new Date(Date.now()).toLocaleDateString()}`)
                    })
                }
            })
            // getAllCache()
            // clearCache()
        })
        document.addEventListener('load', function() {
            cleanJS()
            cleanIframes()
        })
    }
})

function cleanJS() {
    let scriptTags = document.querySelectorAll('script')
    for (scriptTag of scriptTags) {
        scriptTag.remove()
    }
    // clear navigator object
    window.navigator = {}
    log(`Successfully cached DOM. ${scriptTags.length} script(s) successfully removed`)
}

function cleanIframes() {
    let iframeTags = document.querySelectorAll('iframe')
    for (iframeTag of iframeTags) {
        iframeTag.remove()
    }
    log(`Successfully removed ${iframeTags.length} iframe(s)`)
}

function getDomSize() {
    let DOM = document.querySelectorAll('*')
    let size = 0
    for(let x = 0; x < DOM.length; x++) {
        size += DOM[x].innerHTML.length
    }
    return size
}

function getSetting(setting, cb) {
    chrome.storage.local.get(setting, cb);
}

function log(message) {
    console.log(`%cblackhole 🧹: ${message}`, "font-size: 12px; font-weight: bold; background-color: black;")
}

function collectCache() {
    var data = document.documentElement.innerHTML
    // data = data.replace(/\s/g, "") // clear whitespace

    return data
}

function bytesToSize(bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Byte';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}