(() => {

    function log(msg) {
        console.info(new Date().toLocaleTimeString() + " " + msg);
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function waitPageLoad() {
        if (document.readyState === "complete") {
            log("Page loaded");
            return;
        } else {
            log('wait for page loading...');
            await sleep(1000);
            await waitPageLoad();
        }
    }

    async function waitForElement(selector, timeout = 15000) {
        const start = Date.now();
        while (Date.now() - start < timeout) {
            const el = document.querySelector(selector);
            if (el) {
                log(el)
                return el;
            }
            await sleep(1000);
        }
        throw new Error('element not found for selector: ' + selector);
    }

    async function searchByNumber(cadNumber) {
        await waitPageLoad();
        const s = document.querySelector("#cadastr_find_by_cadnum_cadNum");
        s.value = cadNumber
        const b = await waitForElement("div.box-footer.text-right button");
        s.dispatchEvent(new Event('input', { bubbles: true }));
        b.click();
        return "SEARCH_DONE for " + cadNumber;
    }

    async function downloadLnFile() {
            await waitPageLoad();
            const downloadBtn = await waitForElement("#in4btn");
            downloadBtn.click();
            return "DOWNLOAD_BUTTON_CLICKED";
    }


    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        if (obj.type === "SEARCH") {
            searchByNumber(obj.cadNumber).then(result => {
                response({complete: true, result: result});
              });
            return true;
        } else if (obj.type === "DOWNLOAD") {
            downloadLnFile().then(result => {
                response({complete: true, result: result});
              });
            return true;
        }
    });
})();

