const startUrl = 'https://e.land.gov.ua/back/parcel_registration';
const searchUrl = 'https://e.land.gov.ua/back/cadaster/';
let remaining = 0;
let tab2 = null;
let isTab2Loaded = false;
let lastDownloadedUrl = null;

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status == 'complete' && tab2 !== null) {
        setBadge(remaining);
    }
    if (changeInfo.status == 'complete' && tab.id === tab2?.id) {
        isTab2Loaded = true;
    }
});

async function setBadge(msg) {
    await chrome.action.setBadgeText({
        tabId: tab2.id,
        text: '' + msg
    });
}

chrome.webRequest.onCompleted.addListener(
    responseDetails => lastDownloadedUrl = responseDetails.url,
    { urls: ["https://e.land.gov.ua/back/cadaster/coords/*"] }
);

function getAllCadNumbers() {
    const allList = document.querySelectorAll("#parcel_registration_parcelsForUnion  label");
    console.info('All list length =' + allList.length);
    const cadNums = [...allList].map(n => n.innerText.replace(/ перетин.*/, ""));
    console.info(cadNums);
    return cadNums;
}

function log(msg) {
    console.info(new Date().toLocaleTimeString() + " " + msg);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForFunction(func) {
    if (func()) {
        return;
    } else {
        await sleep(1000); 
        await waitForFunction(func);
    }
}

async function executeScriptWrap(tab, funcName, arguments = []) {
    return await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: funcName,
        args: arguments
    });
}


function sendMessagePromise(msg) {
    return new Promise((resolve, reject) => {
        chrome.tabs.sendMessage(tab2.id, msg, response => {
            if (response.complete) {
                resolve(response.result);
            } else {
                reject('Something wrong');
            }
        });
    });
}

async function doSearch(cadNumber) {
    log("Search start " + cadNumber);
    let res = await sendMessagePromise({
        type: "SEARCH",
        cadNumber: cadNumber
    });
    log("Search finished: " + res);
}


async function doDownload() {
    log("Download start");
    lastDownloadedUrl = null;
    let res = await sendMessagePromise({
        type: "DOWNLOAD"
    });
    log("Download finished " + res);
    await waitForFunction(() => lastDownloadedUrl != null);
    log("lastDownloadedUrl = " + lastDownloadedUrl);
}


chrome.action.onClicked.addListener(async (tab) => {
    if (tab.url.startsWith(startUrl)) {
        const injectionResults = await executeScriptWrap(tab, getAllCadNumbers);
        const res = injectionResults[0].result;
        remaining = res.length;
        log('Extracted res = ' + res);
        await chrome.tabs.create({ url: searchUrl }, async (tab) => {
            tab2 = tab;
        });
        for (const cadNum of res) {
            isTab2Loaded = false;
            await chrome.tabs.update({ url: searchUrl });
            await waitForFunction(() => isTab2Loaded);
            await doSearch(cadNum);
            await doDownload();
            await setBadge(--remaining);
        }
    }
});
