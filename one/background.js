const startUrl = 'https://e.land.gov.ua/back/parcel_registration';
const searchUrl = 'https://e.land.gov.ua/back/cadaster/';

function searchPage() {  
  const allList = document.querySelectorAll("#parcel_registration_parcelsForUnion  label");
  console.info('All list length =' + allList.length);
  const cadNums = [...allList].map(n => n.innerText.replace(/ перетин.*/, ""));
  console.info("CadNums = " + cadNums);
}

chrome.action.onClicked.addListener(async (tab) => {
  if (tab.url.startsWith(startUrl)) {
    const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
    const nextState = prevState === 'ON' ? 'OFF' : 'ON';
    await chrome.action.setBadgeText({
      tabId: tab.id,
      text: nextState
    });

    console.info('Here');
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: searchPage
    });
  }
});
