(() => {
    let cadNumber = '';

    function log(msg) {
        console.info(new Date().toLocaleTimeString() + " " + msg);
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function waitPageLoad() {
        if (document.readyState === "complete") {
            return;
        } else {
            alert('wait for page loading...');
            log('wait for page loading...');
            sleep(1000).then(waitPageLoad);
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

    async function searchByNumber() {
        log("searchByNumber start " + cadNumber);
        waitPageLoad();
        const s = document.querySelector("#cadastr_find_by_cadnum_cadNum");
        s.value = cadNumber
        const b = await waitForElement("div.box-footer.text-right button");
        s.dispatchEvent(new Event('input', { bubbles: true }));
        b.click();
        await sleep(1000);
        log("searchByNumber finish " + cadNumber);
        return "SEARCH_DONE";
        // return new Promise((resolve, reject) => {        
        //     resolve("SEARCH_DONE");
        // });
    }

    async function downloadLnFile() {
            log("downloadLnFile start");
            waitPageLoad();
            const downloadBtn = await waitForElement("#in4btn");
            downloadBtn.click();
            await sleep(1000);
            return "DOWNLOAD_COMPLEATED";
    }


    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        if (obj.type === "SEARCH") {
            cadNumber = obj.cadNumber;
            let res = searchByNumber();
            response(res);
        } else if (obj.type === "DOWNLOAD") {
            let res = downloadLnFile();
            response(res);
        }
    });
})();

