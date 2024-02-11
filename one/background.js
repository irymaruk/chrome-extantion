const startUrl = 'https://e.land.gov.ua/back/parcel_registration';
const searchUrl = 'https://e.land.gov.ua/back/cadaster/';
let remaining = 0;
let tab2 = null;

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status == 'complete' && tab2 !== null) {
        await setBadge(tab2, remaining);
    }
});

async function setBadge(tab, msg) {
    await chrome.action.setBadgeText({
        tabId: tab.id,
        text: '' + msg
    });
}

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

async function executeScriptWrap(tab, funcName, arguments = []) {
    return await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: funcName,
        args: arguments
    });
}

async function doSearch(tab2, cadNumber) {
    log("Search start");
    let searchResp = await chrome.tabs.sendMessage(tab2.id, {
        type: "SEARCH",
        cadNumber: cadNumber
    });
    log("Search finished: " + searchResp);
    return searchResp;
}


async function doDownload(tab2) {
    log("Download start");
    let downloadResp = await chrome.tabs.sendMessage(tab2.id, {
        type: "DOWNLOAD"
    });
    await sleep(2000);
    log("Download finished " + downloadResp);
}


chrome.action.onClicked.addListener(async (tab) => {
    if (tab.url.startsWith(startUrl)) {
        const injectionResults = await executeScriptWrap(tab, getAllCadNumbers);
        const res = injectionResults[0].result;
        log('Extracted res = ' + res);
        tab2 = await chrome.tabs.create({ url: searchUrl });
        await sleep(2000);
        remaining = res.length;
        for (const cadNum of res) {
            await chrome.tabs.update({ url: searchUrl });
            await sleep(2000);
            await doSearch(tab2, cadNum);
            await doDownload(tab2);
            await setBadge(tab2, --remaining);
        }
    }
});
