// Background Service Worker
chrome.action.onClicked.addListener(function(tab) {
  if (tab && tab.url && /^https:\/\/www\.instagram\.com\//.test(tab.url)) {
    inject(tab.id);
    return;
  }

  chrome.tabs.create({ url: 'https://www.instagram.com' }, function(newTab) {
    chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
      if (tabId === newTab.id && changeInfo.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(listener);
        inject(newTab.id);
      }
    });
  });
});

function inject(tabId) {
  chrome.scripting.executeScript({
    files: ['modalStyle.js', 'scannerEngine.js'],
    target: { tabId: tabId }
  }).catch(e => console.log('[InstaCleaner] Falha ao injetar script:', e));
}
