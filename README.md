## ❤️‍🩹 Not really battle tested, use at your own discretion. 

# Personal Scripts Collection

A collection of utility scripts developed for personal use.

## Scripts

### Kagi Webpage Summarizer
A browser userscript that adds a small floating "K" button to webpages, allowing you to instantly summarize the current page using Kagi's summarization service.

**Usage:**
- Install as a userscript in your browser extension (like Tampermonkey)
- Click the "K" button that appears on any webpage to open the Kagi Summarizer

### VirusTotal Scanner
A Python script that recursively scans files in a directory, calculating their hash values and checking them against the VirusTotal database for potential security threats.

**Usage:**
```bash
# Update the API key and target directory in the script
python src/virustotal_scanner.py
```

## Requirements

- VirusTotal Scanner requires the `vt` and standard Python libraries
- Kagi Summarizer requires a browser with userscript support