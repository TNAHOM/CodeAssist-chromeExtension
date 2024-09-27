chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "scrape") {
        // Existing functionality to scrape the 'view-lines' class
        const element = document.querySelector('.view-lines');
        if (element) {
            sendResponse({ text: element.textContent });
        } else {
            sendResponse({ text: null });
        }
    } else if (request.action === "scrape_elfjS") {
        const title = document.querySelector('.text-title-large')
        // Find the <a> tag inside the element
        const linkTitle = title.querySelector('a');
        // New functionality to scrape the 'elfjS' class and handle superscripts
        const element = document.querySelector('.elfjS');

        if (element && linkTitle) {
            // Use innerHTML to access the structure of the element
            let htmlContent = element.innerHTML;

            // Regex to find <sup> tags and convert them to ** notation
            htmlContent = htmlContent.replace(/<sup>(\d+)<\/sup>/g, '**$1');
            let combinedHTML = "Leetcode question title: " + linkTitle + " Question description: " + htmlContent;

            sendResponse({ text: combinedHTML });
        } else {
            sendResponse({ text: null });
        }
    } else if (request.action === "toggleScraper") {
        // Add functionality to toggle scraper here
        // This is to handle the message from the background script
        sendResponse({ message: "Scraper toggled" });
    }
    return true;
});
