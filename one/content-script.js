(() => {

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

    async function searchByNumber(cadNum) {
        console.info("searchByNumber start info " + cadNum)
        log("searchByNumber start");
        const searchInput = await waitForElement("#cadastr_find_by_cadnum_cadNum");
        await searchInput.value = '0721486901:01:001:1069';
        document.querySelector("div.box-footer.text-right button").click();
        await sleep(1000);
    }


    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const {type, cadNumber} = obj;
        if (type === "SEARCH") {
            response(searchByNumber(cadNumber));
        } else if (type === "DOWNLOAD") {
            response(searchByNumber(cadNumber));
        }
    });
})();

