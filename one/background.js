const startUrl = 'https://e.land.gov.ua/back/parcel_registration';
const searchUrl = 'https://e.land.gov.ua/back/cadaster/';

chrome.action.onClicked.addListener(async (tab) => {
  if (tab.url.startsWith(startUrl)) {
    const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
    const nextState = prevState === 'ON' ? 'OFF' : 'ON';
    await chrome.action.setBadgeText({
      tabId: tab.id,
      text: nextState
    });

    console.info("Here");
  }
});
