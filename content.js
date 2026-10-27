// InstaCleaner - Content Script Engine (Injetado no Instagram)
console.log('[InstaCleaner] Motor de remoção segura carregado.');

let isRunning = false;
let isPaused = false;
let shouldStop = false;

// 1. Encontra a caixa interna correta onde está a barra de rolagem dos seguidos
function getScrollBox() {
  const dialog = document.querySelector('div[role="dialog"]');
  if (dialog) {
    const scrollable = Array.from(dialog.querySelectorAll('div')).find(
      el => el.scrollHeight > el.clientHeight && getComputedStyle(el).overflowY.match(/auto|scroll/)
    );
    if (scrollable) return scrollable;
  }
  const scrollables = Array.from(document.querySelectorAll('div, ul, main, section')).filter(
    el => el.scrollHeight > el.clientHeight + 50 && getComputedStyle(el).overflowY.match(/auto|scroll/)
  );
  if (scrollables.length > 0) {
    scrollables.sort((a, b) => b.scrollHeight - a.scrollHeight);
    return scrollables[0];
  }
  return document.scrollingElement || document.documentElement || window;
}

function scrollDown(box) {
  if (box && box.scrollBy) {
    box.scrollBy({ top: 450, behavior: 'smooth' });
  } else {
    window.scrollBy(0, 450);
  }
}

function parseUser(a) {
  try {
    const href = a.getAttribute('href') || '';
    const url = new URL(href, window.location.origin);
    const parts = url.pathname.split('/').filter(Boolean);
    if (parts.length === 1) {
      return parts[0].toLowerCase();
    }
  } catch (e) {}
  return null;
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function waitWithPauseCheck(totalMs) {
  const interval = 500;
  let elapsed = 0;
  while (elapsed < totalMs) {
    if (shouldStop) return;
    while (isPaused && !shouldStop) {
      await sleep(1000);
    }
    await sleep(interval);
    elapsed += interval;
  }
}

// 2. Loop Principal de Remoção
async function runUnfollow(targetsArray, speedMode = 'slow') {
  if (isRunning) return;
  isRunning = true;
  shouldStop = false;
  isPaused = false;

  const targetUsers = new Set(targetsArray.map(u => u.toLowerCase()));
  const totalOriginal = targetUsers.size;
  let count = 0;
  let batchCount = 0;
  let scrollAttempts = 0;

  chrome.storage.local.set({
    runningState: { isRunning: true, count: 0, total: totalOriginal, lastUser: '' }
  });

  while (targetUsers.size > 0 && !shouldStop) {
    while (isPaused && !shouldStop) {
      await sleep(1000);
    }
    if (shouldStop) break;

    const box = getScrollBox();

    // Procura na tela alvos que estão na lista
    const matchingLinks = Array.from(document.querySelectorAll('a[href]')).filter(a => {
      const user = parseUser(a);
      return user && targetUsers.has(user);
    });

    if (matchingLinks.length === 0) {
      scrollAttempts++;
      scrollDown(box);
      await sleep(2500);

      if (scrollAttempts >= 10) {
        console.log('[InstaCleaner] Fim da lista ou nenhum novo alvo encontrado.');
        break;
      }
      continue;
    }

    scrollAttempts = 0;
    const targetLink = matchingLinks[0];
    const username = parseUser(targetLink);

    const row = targetLink.closest('div[role="listitem"]') || 
                targetLink.closest('li') || 
                targetLink.closest('div:has(button)') || 
                targetLink.parentElement.parentElement;

    const btn = row ? Array.from(row.querySelectorAll('button')).find(b => {
      const txt = b.innerText.trim().toLowerCase();
      return txt.includes('seguir') || txt.includes('following');
    }) : null;

    if (btn) {
      btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
      await sleep(1500);
      if (shouldStop) break;
      btn.click();
      await sleep(2000);
      if (shouldStop) break;

      // Confirmação no pop-up: aceita "Não seguir", "Deixar de seguir", "Unfollow"
      const confirmBtn = Array.from(document.querySelectorAll('button')).find(b => {
        const txt = b.innerText.trim().toLowerCase();
        return (
          txt.includes('não seguir') || 
          txt.includes('nao seguir') || 
          txt.includes('deixar de seguir') || 
          txt.includes('unfollow')
        ) && !txt.includes('cancel');
      });

      if (confirmBtn) {
        confirmBtn.click();
        count++;
        batchCount++;
        targetUsers.delete(username);

        // Notifica o popup
        chrome.runtime.sendMessage({
          type: 'UNFOLLOW_PROGRESS',
          status: 'success',
          user: username,
          count: count,
          total: totalOriginal,
          remaining: targetUsers.size
        }).catch(() => {});

        chrome.storage.local.set({
          runningState: { isRunning: true, count, total: totalOriginal, lastUser: username }
        });

        // Configurações de velocidade
        if (speedMode === 'slow') {
          // Pausa longa (café) a cada 10 pessoas
          if (batchCount >= 10) {
            batchCount = 0;
            const coffeeBreakSecs = Math.floor(Math.random() * (1200 - 600 + 1) + 600);
            chrome.runtime.sendMessage({
              type: 'UNFOLLOW_PROGRESS',
              status: 'coffee',
              duration: coffeeBreakSecs,
              count,
              total: totalOriginal
            }).catch(() => {});
            await waitWithPauseCheck(coffeeBreakSecs * 1000);
          } else {
            // Espera padrão: 60 a 180 segundos
            const waitSecs = Math.floor(Math.random() * (180 - 60 + 1) + 60);
            chrome.runtime.sendMessage({
              type: 'UNFOLLOW_PROGRESS',
              status: 'waiting',
              seconds: waitSecs,
              count,
              total: totalOriginal
            }).catch(() => {});
            await waitWithPauseCheck(waitSecs * 1000);
          }
        } else {
          // Modo Moderado: 15 a 30 segundos
          if (count >= 25) {
            console.log('[InstaCleaner] Limite de 25 contas atingido para o modo moderado.');
            break;
          }
          const waitSecs = Math.floor(Math.random() * (30 - 15 + 1) + 15);
          chrome.runtime.sendMessage({
            type: 'UNFOLLOW_PROGRESS',
            status: 'waiting',
            seconds: waitSecs,
            count,
            total: totalOriginal
          }).catch(() => {});
          await waitWithPauseCheck(waitSecs * 1000);
        }

      } else {
        // Se modal não abriu, desobstrui a tela clicando em cancelar se houver
        const cancelBtn = Array.from(document.querySelectorAll('button')).find(b => 
          b.innerText.trim().toLowerCase().includes('cancel')
        );
        if (cancelBtn) cancelBtn.click();
        targetUsers.delete(username);
        await sleep(2000);
      }
    } else {
      targetUsers.delete(username);
      scrollDown(box);
      await sleep(2000);
    }
  }

  isRunning = false;
  chrome.storage.local.set({ runningState: { isRunning: false, count, total: totalOriginal } });
  chrome.runtime.sendMessage({
    type: 'UNFOLLOW_PROGRESS',
    status: 'done',
    count,
    total: totalOriginal
  }).catch(() => {});
}

// 3. Ouvinte de Comandos da Interface (Popup)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'START_UNFOLLOW') {
    runUnfollow(request.targets, request.speed);
    sendResponse({ status: 'started' });
  } else if (request.action === 'TOGGLE_PAUSE') {
    isPaused = request.paused;
    sendResponse({ status: isPaused ? 'paused' : 'resumed' });
  } else if (request.action === 'STOP_UNFOLLOW') {
    shouldStop = true;
    isRunning = false;
    sendResponse({ status: 'stopped' });
  }
  return true;
});
