// InstaCleaner - Popup Controller
document.addEventListener('DOMContentLoaded', async () => {
  const usersInput = document.getElementById('usersInput');
  const targetCounter = document.getElementById('targetCounter');
  const btnStart = document.getElementById('btnStart');
  const btnPause = document.getElementById('btnPause');
  const btnStop = document.getElementById('btnStop');
  const runningGroup = document.getElementById('runningGroup');
  const btnClear = document.getElementById('btnClear');
  const btnLoadSaved = document.getElementById('btnLoadSaved');
  const statusBanner = document.getElementById('statusBanner');
  const statusText = document.getElementById('statusText');
  const progressSection = document.getElementById('progressSection');
  const progressBar = document.getElementById('progressBar');
  const progressCount = document.getElementById('progressCount');
  const logBox = document.getElementById('logBox');
  const optSlow = document.getElementById('optSlow');
  const optModerate = document.getElementById('optModerate');

  let activeTabId = null;
  let isPaused = false;

  // 1. Verifica se a aba atual é o Instagram
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.url && tab.url.includes('instagram.com')) {
    activeTabId = tab.id;
    statusBanner.className = 'status-banner ok';
    statusText.innerText = 'Instagram detectado e pronto!';
  } else {
    statusBanner.className = 'status-banner warn';
    statusText.innerText = 'Abra o Instagram no navegador para rodar.';
    btnStart.disabled = true;
  }

  // 2. Extrai e limpa lista de usuários do textarea
  function parseUsers() {
    const raw = usersInput.value || '';
    const items = raw
      .split(/[\n, ]+/)
      .map(u => u.trim().replace(/^@/, '').toLowerCase())
      .filter(u => u.length > 0 && !u.includes('http'));
    
    // Remove duplicados mantendo a ordem
    return Array.from(new Set(items));
  }

  function updateCounter() {
    const users = parseUsers();
    targetCounter.innerText = `${users.length} perfis`;
    // Salva no storage automaticamente
    chrome.storage.local.set({ savedList: usersInput.value });
  }

  usersInput.addEventListener('input', updateCounter);

  // 3. Carregar lista salva anteriormente
  chrome.storage.local.get(['savedList', 'runningState'], (res) => {
    if (res.savedList) {
      usersInput.value = res.savedList;
      updateCounter();
    }
    if (res.runningState && res.runningState.isRunning) {
      restoreRunningUI(res.runningState);
    }
  });

  btnClear.addEventListener('click', () => {
    usersInput.value = '';
    updateCounter();
  });

  btnLoadSaved.addEventListener('click', () => {
    chrome.storage.local.get(['savedList'], (res) => {
      if (res.savedList) {
        usersInput.value = res.savedList;
        updateCounter();
      }
    });
  });

  // 4. Seleção de Velocidade
  optSlow.addEventListener('click', () => {
    optSlow.classList.add('selected');
    optModerate.classList.remove('selected');
    optSlow.querySelector('input').checked = true;
  });

  optModerate.addEventListener('click', () => {
    optModerate.classList.add('selected');
    optSlow.classList.remove('selected');
    optModerate.querySelector('input').checked = true;
  });

  // 5. Adicionar Logs na caixinha
  function addLog(msg, type = 'info') {
    const line = document.createElement('div');
    line.className = `log-line ${type}`;
    line.innerText = `[${new Date().toLocaleTimeString('pt-BR')}] ${msg}`;
    logBox.appendChild(line);
    logBox.scrollTop = logBox.scrollHeight;
  }

  // 6. Iniciar Remoção
  btnStart.addEventListener('click', async () => {
    const users = parseUsers();
    if (users.length === 0) {
      alert('Por favor, cole ou digite pelo menos um perfil para deixar de seguir.');
      return;
    }

    if (!activeTabId) {
      alert('Por favor, navegue até a aba do Instagram antes de iniciar.');
      return;
    }

    const speed = document.querySelector('input[name="speed"]:checked').value;

    btnStart.classList.add('hidden');
    runningGroup.classList.remove('hidden');
    progressSection.classList.remove('hidden');
    logBox.innerHTML = '';
    addLog(`Iniciando remoção segura de ${users.length} perfis...`, 'info');

    chrome.tabs.sendMessage(activeTabId, {
      action: 'START_UNFOLLOW',
      targets: users,
      speed: speed
    }, (response) => {
      if (chrome.runtime.lastError) {
        addLog('Erro ao comunicar com a página. Recarregue o Instagram (F5).', 'warn');
        resetUI();
      }
    });
  });

  // 7. Pausar / Continuar
  btnPause.addEventListener('click', () => {
    isPaused = !isPaused;
    if (isPaused) {
      btnPause.innerText = '▶️ Continuar';
      addLog('Processo pausado pelo usuário.', 'warn');
    } else {
      btnPause.innerText = '⏸️ Pausar';
      addLog('Processo retomado.', 'info');
    }
    chrome.tabs.sendMessage(activeTabId, { action: 'TOGGLE_PAUSE', paused: isPaused });
  });

  // 8. Parar
  btnStop.addEventListener('click', () => {
    if (confirm('Deseja realmente interromper o processo agora?')) {
      chrome.tabs.sendMessage(activeTabId, { action: 'STOP_UNFOLLOW' });
      resetUI();
      addLog('Processo interrompido.', 'warn');
    }
  });

  function resetUI() {
    btnStart.classList.remove('hidden');
    runningGroup.classList.add('hidden');
    btnPause.innerText = '⏸️ Pausar';
    isPaused = false;
  }

  function restoreRunningUI(state) {
    btnStart.classList.add('hidden');
    runningGroup.classList.remove('hidden');
    progressSection.classList.remove('hidden');
    updateProgressUI(state.count, state.total, state.lastUser);
  }

  function updateProgressUI(count, total, lastUser) {
    const percent = total > 0 ? Math.round((count / total) * 100) : 0;
    progressBar.style.width = `${percent}%`;
    progressCount.innerText = `${count} / ${total}`;
  }

  // 9. Ouvir mensagens de progresso do content.js
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'UNFOLLOW_PROGRESS') {
      updateProgressUI(msg.count, msg.total, msg.user);
      if (msg.status === 'success') {
        addLog(`Desseguiu @${msg.user}! (Restam: ${msg.remaining})`, 'success');
      } else if (msg.status === 'coffee') {
        addLog(`☕ Pausa para café: descansando ${(msg.duration / 60).toFixed(0)} min...`, 'coffee');
      } else if (msg.status === 'waiting') {
        addLog(`⏳ Aguardando ${msg.seconds}s até o próximo perfil...`, 'info');
      } else if (msg.status === 'done') {
        addLog(`🎉 Concluído com sucesso! Total: ${msg.count}`, 'success');
        resetUI();
      }
    }
  });
});
