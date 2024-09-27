document.addEventListener('DOMContentLoaded', function () {
    const scrapeButton = document.getElementById('scrapeButton');
    const resultDiv = document.getElementById('result');
    const codeElement = resultDiv.querySelector('code');
    // Created just to pass the code in a formatted manner to the get_hint
    const codeElementPass = document.createElement('code');
    const codeBlock = document.createElement('pre');



    const hintButtonLow = document.getElementById('hintButtonLow');
    const hintButtonMedium = document.getElementById('hintButtonMedium');
    const hintButtonHigh = document.getElementById('hintButtonHigh');
    const explainButton = document.getElementById('explainButton');
    const hintDiv = document.getElementById('hintResult');
    const explainDiv = document.getElementById('explain');

    const submitButton = document.getElementById('submitButton');
    const userPrompt = document.getElementById('userPrompt');

    scrapeButton.addEventListener('click', function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "scrape" }, function (response) {
                if (response && response.code) {
                    codeElement.textContent = response.code;
                    Prism.highlightElement(codeElement);
                    resultDiv.style.display = 'block';
                    copyButton.style.display = 'block';
                } else {
                    resultDiv.textContent = 'No code found or error occurred.';
                }
            });
        });
    });

    function getHint(text, buttonType) {
        fetch('http://localhost:8000/get_hint', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: text,
                action: buttonType
            })
        })
            .then(response => response.json())
            .then(data => {
                if (buttonType === 'questionBreakdown') {
                    explainDiv.innerHTML = `
                        <h2 class="explain-header">Explanation</h2>
                        <div class="explain-body">${data.hint}</div>
                    `;
                    explainDiv.style.display = 'block';
                } else {
                    hintDiv.innerHTML = `
                        <h2 class="hint-header">${buttonType.toUpperCase()}</h2>
                        <div class="hint-body">${data.hint}</div>
                    `;
                    hintDiv.style.display = 'block';
                }
            })
            .catch(error => console.error('Error fetching hint:', error));
    }

    function scrapeAndGetHint(buttonType) {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "scrape_elfjS" }, function (response) {
                if (response && response.question) {
                    const scrapedText = response.question;
                    getHint(scrapedText, buttonType);
                } else {
                    hintDiv.innerHTML = `
                        <h2 class="hint-header">Error</h2>
                        <div class="hint-body">No text found or error occurred.</div>
                    `;
                }
            });
        });
    }

    hintButtonLow.addEventListener('click', function () {
        scrapeAndGetHint('low');
    });

    hintButtonMedium.addEventListener('click', function () {
        scrapeAndGetHint('medium');
    });

    hintButtonHigh.addEventListener('click', function () {
        scrapeAndGetHint('high');
    });

    explainButton.addEventListener('click', function () {
        scrapeAndGetHint('questionBreakdown');
    });

    // Handle custom prompt submission
    submitButton.addEventListener('click', function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            // Scrape both code and question
            chrome.tabs.sendMessage(tabs[0].id, { action: "scrape" }, function (codeResponse) {
                chrome.tabs.sendMessage(tabs[0].id, { action: "scrape_elfjS" }, function (questionResponse) {
                    if (codeResponse && questionResponse) {
                        const customPrompt = userPrompt.value;
                        const formatedCode = codeResponse.code;
                        codeElementPass.textContent = formatedCode;
                        codeBlock.appendChild(codeElement);
                        Prism.highlightElement(codeElement);
                        const highlightedCode = codeElementPass.innerHTML;

                        const combinedText = `
                            Custom Prompt: ${customPrompt} 
                            \n\nCode Snippet:\n${highlightedCode}
                            \n\nLeetcode Question:\n${questionResponse.question}
                        `;

                        fetch('http://localhost:8000/get_hint', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                text: combinedText,
                                action: 'custom' // New action type for user prompt
                            })
                        })
                            .then(response => response.json())
                            .then(data => {
                                hintDiv.innerHTML = `
                                    <h2 class="hint-header">Custom Prompt Result</h2>
                                    <div class="hint-body">${data.hint}</div>
                                `;
                                hintDiv.style.display = 'block';
                            })
                            .catch(error => console.error('Error fetching custom prompt response:', error));
                    } else {
                        hintDiv.innerHTML = `
                            <h2 class="hint-header">Error</h2>
                            <div class="hint-body">Unable to scrape code or question.</div>
                        `;
                    }
                });
            });
        });
    });
});
