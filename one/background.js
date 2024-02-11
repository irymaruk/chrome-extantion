const startUrl = 'https://e.land.gov.ua/back/parcel_registration';
const searchUrl = 'https://e.land.gov.ua/back/cadaster/';

async function changeBadge(tab) {
    const prevState = await chrome.action.getBadgeText({tabId: tab.id});
    const nextState = prevState === 'ON' ? 'OFF' : 'ON';
    await chrome.action.setBadgeText({
        tabId: tab.id,
        text: nextState
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
        target: {tabId: tab.id},
        func: funcName,
        args: arguments
    });
}


chrome.action.onClicked.addListener(async (tab) => {
    if (tab.url.startsWith(startUrl)) {
        await changeBadge(tab);

        log('Here');
        const injectionResults = await executeScriptWrap(tab, getAllCadNumbers);

        const res = injectionResults[0].result;
        log('Extracted res = ' + res);
        const tab2 = await chrome.tabs.create({url: searchUrl});
        await sleep(3000);

        log("Search start");
        let searchResp = await chrome.tabs.sendMessage(tab2.id, {
            type: "SEARCH",
            cadNumber: '0721486901:01:001:1069'
        });
        log("Search finished: " + searchResp.msg);

        await sleep(3000);
        log("Download start");
        let downloadResp = await chrome.tabs.sendMessage(tab2.id, {
            type: "DOWNLOAD"
        });
        log("Download finished " + downloadResp);
    }
});
