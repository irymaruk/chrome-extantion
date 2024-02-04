const startUrl = 'https://e.land.gov.ua/back/parcel_registration';
const searchUrl = 'https://e.land.gov.ua/back/cadaster/';

async function changeBadge(tab) {
  const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
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
  console.info("CadNums = " + cadNums);
  return cadNums;
}


function doSearch() {
  const allList = document.querySelectorAll("#parcel_registration_parcelsForUnion  label");
  console.info('All list length =' + allList.length);
  const cadNums = [...allList].map(n => n.innerText.replace(/ перетин.*/, ""));
  console.info("CadNums = " + cadNums);
  return cadNums;
}

function log(msg) {
  console.info(new Date().toLocaleTimeString() + " " + msg);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForElement(selector, timeout = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const el = document.querySelector(selector);
    if (el) {
      return el;
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  return null;
}






chrome.action.onClicked.addListener(async (tab) => {
  if (tab.url.startsWith(startUrl)) {
    await changeBadge(tab);

    log('Here');
    const injectionResults = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: getAllCadNumbers
    });

    const res = injectionResults[0].result;
    log('Exctracted res = ' + res);
    const tab2 = await chrome.tabs.create({ url: searchUrl });
    await sleep(1000);
    
    for (const num of res) {
      // const tab2 = await chrome.tabs.update(tab.id, { url: searchUrl });
      
      await log("Number = " + num);
    }
  }
});
