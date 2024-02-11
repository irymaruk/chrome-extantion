(() => {
    let cadNumber = '';

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
                log(el)
                return el;
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        log("element not found for selector: " + selector)
        return null;
    }

    async function searchByNumber() {
        log("searchByNumber start " + cadNumber);
        const s = document.querySelector("#cadastr_find_by_cadnum_cadNum");
        s.value = cadNumber
        const b = await waitForElement("div.box-footer.text-right button");
        s.dispatchEvent(new Event('input', {bubbles: true}));
        b.click();
        return new Promise(resolve => {msg: "SEARCH_DONE"});
    }

    async function downloadLnFile() {
        log("downloadLnFile start");
        const downloadBtn = await waitForElement("#in4btn");
        downloadBtn.click();
        await sleep(1000);
    }


    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        if (obj.type === "SEARCH") {
            cadNumber = obj.cadNumber;
            response(searchByNumber());
        } else if (obj.type === "DOWNLOAD") {
            downloadLnFile();
            response({msg: "Download complete"});
        }
    });
})();

