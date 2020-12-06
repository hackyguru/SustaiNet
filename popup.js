var cacheData = []

// Set activation button state
window.addEventListener('load', function load(event){
    var activateBtn = document.getElementById('activateBtn');
    var colorReductionBtn = document.getElementById('colorReductionBtn')
    var collectCacheBtn = document.getElementById('collectCacheBtn')
    var clearCacheBtn = document.getElementById('clearCacheBtn')
    var cacheList = document.querySelector("#cacheList")

    getLocalActivationValue(function (items) {
        let response = items.buttonActive
        activateBtn.checked = response
    })

    // Settings
    getSetting("colorReduction", function(items) {
        let response = items.colorReduction
        colorReductionBtn.checked = response
    })

    getSetting("collectCache", function(items) {
        let response = items.collectCache
        collectCacheBtn.checked = response
    })

    // Retrieve Cache
    getCache(function(items) {
        var caches = items.cachedPages
        for(let x = 0; x < caches.length; x++) {
            cacheData.push(caches[x].data)
            cacheList.appendChild(newCacheItem(caches[x].site, x))
        }
    })

    activateBtn.addEventListener('click', function() {
        setLocalActivationValue(this.checked, () => {
            console.log("Changed activiation button state to", this.checked)
        }) 
    });
    
    colorReductionBtn.addEventListener('click', function() {
        setSetting("colorReduction", this.checked, () => {
            console.log("Changed color reduction to", this.checked)
        })
    })

    collectCacheBtn.addEventListener('click', function() {
        setSetting("collectCache", this.checked, () => {
            console.log("Changed collect cache to", this.checked)
        })
    })

    clearCacheBtn.addEventListener('click', function() {
        clearCache()
        location.reload()
    })
    // EventListener for cache links
    cacheList.addEventListener('click', function(cache) {
        cache = cache.target
        let cacheKey = cache.getAttribute("key")
        let popupWindow = window.open("", null, "height=1000,width=1000,status=yes,toolbar=no,menubar=no,location=no")
        popupWindow.document.documentElement.innerHTML = '';
        popupWindow.document.documentElement.innerHTML = cacheData[cacheKey]
    } ,false)
})

function getLocalActivationValue(cb) {
    chrome.storage.local.get("buttonActive", cb);
}

function setLocalActivationValue(val, cb) {
    chrome.storage.local.set({ "buttonActive": val }, cb);
}

function getSetting(setting, cb) {
    chrome.storage.local.get(setting, cb);
}

function setSetting(setting, val, cb) {
    chrome.storage.local.set({ [setting]: val }, cb);
}

function getCache(cb) {
    chrome.storage.local.get("cachedPages", cb)
}

function newCacheItem(site, key) {
    let cache = document.createElement("li")
    let cacheLink = document.createElement("a")
    
    cacheLink.setAttribute("class", "cache")
    cacheLink.setAttribute("style", "font-size: 14px;")
    cacheLink.setAttribute("key", key)

    cacheLink.innerText = site

    cache.appendChild(cacheLink)

    return cache
}

function clearCache() {
    chrome.storage.local.set({ "cachedPages": [] });
}