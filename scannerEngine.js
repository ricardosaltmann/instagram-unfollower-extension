// InstaCleaner - Motor de Análise e Remoção Automática
(function initInstaCleaner() {
  if (document.getElementById('ic-modal')) {
    document.getElementById('ic-modal').classList.remove('ic-hidden');
    return;
  }

  // Helpers de Cookies e Sessão
  function getCookie(name) {
    const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  }

  const viewerId = getCookie('ds_user_id');
  const csrfToken = getCookie('csrftoken');
  const appId = '936619743392459';

  if (!viewerId) {
    alert('Por favor, faça login no Instagram e tente novamente.');
    return;
  }

  const baseHeaders = {
    'X-CSRFToken': csrfToken || '',
    'X-IG-App-ID': appId,
    'X-Requested-With': 'XMLHttpRequest',
    'X-ASBD-ID': '359341'
  };

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  // Injeta Estrutura HTML do Modal
  const modalHtml = `
    <div class="ic-modal" id="ic-modal">
      <div class="ic-dialog">
        <!-- Header -->
        <div class="ic-header">
          <div class="ic-title">
            <span>⚡ Não Seguidores</span>
            <span class="ic-badge">100% Grátis & Ilimitado</span>
          </div>
          <button class="ic-close" id="ic-close-btn">&times;</button>
        </div>

        <!-- Body -->
        <div class="ic-body">
          <div class="ic-desc">
            Esta ferramenta analisa diretamente no seu navegador quem você segue e compara com os seus seguidores para identificar quem <b>não te segue de volta</b>. Em seguida, permite remover todos automaticamente de forma segura.
          </div>

          <!-- Cards de Estatísticas -->
          <div class="ic-stats-row">
            <div class="ic-stat-card">
              <div class="ic-stat-val" id="ic-count-followers">-</div>
              <div class="ic-stat-lbl">Seguidores</div>
            </div>
            <div class="ic-stat-card">
              <div class="ic-stat-val" id="ic-count-following">-</div>
              <div class="ic-stat-lbl">A Seguir</div>
            </div>
            <div class="ic-stat-card highlight">
              <div class="ic-stat-val" id="ic-count-nonfollowers">-</div>
              <div class="ic-stat-lbl">Não Te Seguem</div>
            </div>
          </div>

          <!-- Ação 1: Escanear -->
          <div class="ic-actions-bar">
            <button class="ic-btn ic-btn-primary" id="ic-btn-scan">
              <span>🔍 Carregar Não-Seguidores</span>
            </button>
            <span id="ic-scan-status" style="font-size: 12px; color: #64748b;"></span>
          </div>

          <!-- Configuração de Velocidade -->
          <div class="ic-speed-box">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <b>Modo de Remoção Automática:</b>
              <span style="font-size: 11px; background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 6px; font-weight: 600;">🛡️ Proteção Anti-Bloqueio</span>
            </div>
            <div class="ic-speed-options">
              <label>
                <input type="radio" name="ic-speed" value="slow" checked>
                ☕ Modo Dia Inteiro (1 a 3 min + Pausas de Café)
              </label>
              <label>
                <input type="radio" name="ic-speed" value="moderate">
                ⚡ Modo Rápido (15 a 30 seg)
              </label>
            </div>
            <div style="font-size: 11px; color: #92400e; background: #fffbeb; border: 1px solid #fde68a; padding: 6px 10px; border-radius: 6px; line-height: 1.4;">
              💡 <b>Recomendação Anti-Bloqueio do Instagram:</b> Para evitar bloqueios temporários por parte do Instagram, escolha sempre a velocidade com cautela. Para listas grandes, o Modo Dia Inteiro garante intervalos humanos e pausas automáticas; utilize o Modo Rápido para limpezas pontuais em lotes menores.
            </div>
          </div>

          <!-- Filtro e Seleção -->
          <div class="ic-filter-bar">
            <input type="text" class="ic-search" id="ic-search-input" placeholder="Filtrar por nome ou @usuário...">
            <span class="ic-select-all" id="ic-btn-toggle-all">Desmarcar Todos</span>
          </div>

          <!-- Barra de Progresso da Remoção -->
          <div class="ic-progress-container ic-hidden" id="ic-progress-box">
            <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 600;">
              <span id="ic-progress-label">Removendo...</span>
              <span id="ic-progress-counter">0 / 0</span>
            </div>
            <div class="ic-progress-bar-bg">
              <div class="ic-progress-bar-fill" id="ic-progress-fill"></div>
            </div>
            <div class="ic-log-text" id="ic-log-msg">Iniciando...</div>
          </div>

          <!-- Ação 2: Controles de Execução -->
          <div class="ic-actions-bar">
            <button class="ic-btn ic-btn-danger ic-hidden" id="ic-btn-start-unfollow">
              <span>🚀 Deixar de Seguir Selecionados (<span id="ic-selected-count">0</span>)</span>
            </button>
            <button class="ic-btn ic-btn-secondary ic-hidden" id="ic-btn-pause">⏸️ Pausar</button>
            <button class="ic-btn ic-btn-secondary ic-hidden" id="ic-btn-stop">⏹️ Parar</button>
          </div>

          <!-- Lista de Não-Seguidores -->
          <div class="ic-list" id="ic-users-list">
            <div style="padding: 24px; text-align: center; color: #94a3b8; font-size: 13px;">
              Clique em <b>"Carregar Não-Seguidores"</b> acima para buscar a lista automaticamente.
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="ic-footer">
          🔒 100% Seguro & Gratuito • Roda direto na sua sessão oficial do Instagram
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  // Elementos da Interface
  const modal = document.getElementById('ic-modal');
  const btnClose = document.getElementById('ic-close-btn');
  const btnScan = document.getElementById('ic-btn-scan');
  const scanStatus = document.getElementById('ic-scan-status');
  const countFollowers = document.getElementById('ic-count-followers');
  const countFollowing = document.getElementById('ic-count-following');
  const countNonFollowers = document.getElementById('ic-count-nonfollowers');
  const usersListEl = document.getElementById('ic-users-list');
  const searchInput = document.getElementById('ic-search-input');
  const btnToggleAll = document.getElementById('ic-btn-toggle-all');
  const btnStartUnfollow = document.getElementById('ic-btn-start-unfollow');
  const btnPause = document.getElementById('ic-btn-pause');
  const btnStop = document.getElementById('ic-btn-stop');
  const selectedCountEl = document.getElementById('ic-selected-count');
  const progressBox = document.getElementById('ic-progress-box');
  const progressFill = document.getElementById('ic-progress-fill');
  const progressCounter = document.getElementById('ic-progress-counter');
  const logMsg = document.getElementById('ic-log-msg');

  // Estado da Aplicação
  let nonFollowersData = [];
  let isScanning = false;
  let isUnfollowing = false;
  let isPaused = false;
  let shouldStop = false;

  // Fechar Modal
  btnClose.addEventListener('click', () => {
    if (isUnfollowing) {
      if (!confirm('A remoção ainda está em andamento. Deseja fechar a janela? (O processo continuará pausado)')) {
        return;
      }
      shouldStop = true;
    }
    modal.classList.add('ic-hidden');
  });

  // Função para buscar lista paginada do Instagram
  async function fetchPaged(endpoint) {
    const ids = new Set();
    const users = [];
    let nextMaxId = '';

    while (true) {
      let url = `https://www.instagram.com/api/v1/friendships/${viewerId}/${endpoint}/?count=50`;
      if (endpoint === 'followers') {
        url += '&search_surface=follow_list_page';
      } else {
        url += '&order=date_followed_latest';
      }
      if (nextMaxId) {
        url += `&max_id=${encodeURIComponent(nextMaxId)}`;
      }

      const res = await fetch(url, { headers: baseHeaders });
      if (!res.ok) {
        throw new Error(`Erro na API (${res.status}). Aguarde alguns minutos.`);
      }

      const data = await res.json();
      const list = data.users || [];

      for (const u of list) {
        const id = String(u.pk || u.pk_id || u.id);
        if (id && !ids.has(id)) {
          ids.add(id);
          users.push({
            id: id,
            username: u.username,
            full_name: u.full_name || '',
            profile_pic_url: u.profile_pic_url || '',
            selected: true,
            removed: false
          });
        }
      }

      scanStatus.innerText = `Lendo ${endpoint === 'followers' ? 'seguidores' : 'quem você segue'}: ${users.length}...`;
      await sleep(1200); // Pausa segura entre páginas

      if (!data.has_more || !data.next_max_id) {
        break;
      }
      nextMaxId = String(data.next_max_id);
    }

    return { ids, users };
  }

  // 1. AÇÃO: Carregar e Comparar Listas
  btnScan.addEventListener('click', async () => {
    if (isScanning) return;
    isScanning = true;
    btnScan.disabled = true;
    btnScan.innerText = 'Carregando...';
    scanStatus.innerText = 'Iniciando leitura da sua conta...';

    try {
      // 1.1 Busca seguidores
      scanStatus.innerText = 'Lendo seus seguidores...';
      const followers = await fetchPaged('followers');
      countFollowers.innerText = followers.users.length.toLocaleString('pt-BR');

      // 1.2 Busca seguidos
      scanStatus.innerText = 'Lendo quem você segue...';
      const following = await fetchPaged('following');
      countFollowing.innerText = following.users.length.toLocaleString('pt-BR');

      // 1.3 Compara as listas
      nonFollowersData = following.users.filter(u => !followers.ids.has(u.id));
      countNonFollowers.innerText = nonFollowersData.length.toLocaleString('pt-BR');

      scanStatus.innerText = `Concluído! ${nonFollowersData.length} não-seguidores encontrados.`;
      btnScan.innerText = 'Atualizar Lista';
      btnScan.disabled = false;
      isScanning = false;

      // Renderiza na tela
      renderUsersList();
      updateSelectedCount();

      if (nonFollowersData.length > 0) {
        btnStartUnfollow.classList.remove('ic-hidden');
      }

    } catch (err) {
      scanStatus.innerText = `Aviso: ${err.message}`;
      btnScan.innerText = 'Tentar Novamente';
      btnScan.disabled = false;
      isScanning = false;
    }
  });

  // Renderizar a lista de usuários no modal
  function renderUsersList() {
    const filterText = (searchInput.value || '').toLowerCase().trim();
    const filtered = nonFollowersData.filter(u => 
      u.username.toLowerCase().includes(filterText) ||
      u.full_name.toLowerCase().includes(filterText)
    );

    if (filtered.length === 0) {
      usersListEl.innerHTML = `<div style="padding: 24px; text-align: center; color: #94a3b8;">Nenhum perfil encontrado.</div>`;
      return;
    }

    usersListEl.innerHTML = filtered.map(u => `
      <div class="ic-item" data-id="${u.id}">
        <div class="ic-user-info">
          <input type="checkbox" class="ic-user-chk" data-id="${u.id}" ${u.selected ? 'checked' : ''} ${u.removed ? 'disabled' : ''}>
          <img class="ic-avatar" src="${u.profile_pic_url}" loading="lazy" onerror="this.src=''">
          <div class="ic-names">
            <a href="https://www.instagram.com/${u.username}/" target="_blank" class="ic-username">@${u.username}</a>
            <span class="ic-fullname">${u.full_name}</span>
          </div>
        </div>
        <div>
          ${u.removed 
            ? `<span class="ic-status-tag ic-status-removed">Removido ✓</span>` 
            : `<button class="ic-btn ic-btn-secondary ic-single-unfollow" data-id="${u.id}" style="padding: 4px 10px; font-size: 11px;">Desseguir</button>`
          }
        </div>
      </div>
    `).join('');

    // Eventos de Checkbox individual
    usersListEl.querySelectorAll('.ic-user-chk').forEach(chk => {
      chk.addEventListener('change', (e) => {
        const id = e.target.getAttribute('data-id');
        const user = nonFollowersData.find(u => u.id === id);
        if (user) user.selected = e.target.checked;
        updateSelectedCount();
      });
    });

    // Eventos de Desseguir individual
    usersListEl.querySelectorAll('.ic-single-unfollow').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.getAttribute('data-id');
        btn.disabled = true;
        btn.innerText = '...';
        await performSingleUnfollow(id);
      });
    });
  }

  function updateSelectedCount() {
    const count = nonFollowersData.filter(u => u.selected && !u.removed).length;
    selectedCountEl.innerText = count;
    btnStartUnfollow.disabled = count === 0;
  }

  searchInput.addEventListener('input', renderUsersList);

  // Marcar / Desmarcar Todos
  let allSelected = true;
  btnToggleAll.addEventListener('click', () => {
    allSelected = !allSelected;
    btnToggleAll.innerText = allSelected ? 'Desmarcar Todos' : 'Selecionar Todos';
    nonFollowersData.forEach(u => {
      if (!u.removed) u.selected = allSelected;
    });
    renderUsersList();
    updateSelectedCount();
  });

  // Função que faz o Unfollow na API oficial da sessão do usuário
  async function performSingleUnfollow(userId) {
    try {
      const dtsg = (document.documentElement.innerHTML.match(/\["DTSGInitialData",\[\],\{"token":"([^"]+)"/) || [])[1] || '';
      const params = new URLSearchParams({
        container_module: 'profile',
        user_id: userId,
        fb_dtsg: dtsg
      });

      const res = await fetch(`https://www.instagram.com/api/v1/friendships/destroy/${userId}/`, {
        method: 'POST',
        headers: {
          ...baseHeaders,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        credentials: 'include',
        body: params.toString()
      });

      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (data && data.status === 'ok') {
        const user = nonFollowersData.find(u => u.id === userId);
        if (user) {
          user.removed = true;
          user.selected = false;
        }
        renderUsersList();
        updateSelectedCount();
        return true;
      }
      return false;
    } catch (err) {
      console.warn(`[InstaCleaner] Falha ao desseguir ${userId}:`, err);
      return false;
    }
  }

  // 2. AÇÃO: Execução Automática em Massa Segura
  btnStartUnfollow.addEventListener('click', async () => {
    const selected = nonFollowersData.filter(u => u.selected && !u.removed);
    if (selected.length === 0) return;

    if (!confirm(`Deseja iniciar a remoção segura de ${selected.length} perfis? O processo respeitará pausas automáticas para proteger sua conta.`)) {
      return;
    }

    isUnfollowing = true;
    shouldStop = false;
    isPaused = false;

    btnStartUnfollow.classList.add('ic-hidden');
    btnPause.classList.remove('ic-hidden');
    btnStop.classList.remove('ic-hidden');
    progressBox.classList.remove('ic-hidden');

    const speedMode = document.querySelector('input[name="ic-speed"]:checked').value;
    const total = selected.length;
    let completed = 0;
    let batchCount = 0;

    for (const target of selected) {
      if (shouldStop) break;
      while (isPaused && !shouldStop) {
        await sleep(1000);
      }

      logMsg.innerText = `Desseguindo @${target.username}...`;
      const itemEl = usersListEl.querySelector(`[data-id="${target.id}"]`);
      if (itemEl) {
        itemEl.classList.add('active-processing');
        itemEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      const ok = await performSingleUnfollow(target.id);
      if (itemEl) itemEl.classList.remove('active-processing');

      if (ok) {
        completed++;
        batchCount++;
        const pct = Math.round((completed / total) * 100);
        progressFill.style.width = `${pct}%`;
        progressCounter.innerText = `${completed} / ${total}`;
        logMsg.innerText = `✓ @${target.username} removido com sucesso!`;

        // Pausa anti-bloqueio
        if (speedMode === 'slow') {
          if (batchCount >= 10) {
            batchCount = 0;
            const coffeeSecs = Math.floor(Math.random() * (1200 - 600 + 1) + 600);
            logMsg.innerText = `☕ Pausa para café: descansando ${(coffeeSecs/60).toFixed(1)} min...`;
            await sleep(coffeeSecs * 1000);
          } else {
            const waitSecs = Math.floor(Math.random() * (180 - 60 + 1) + 60);
            logMsg.innerText = `Aguardando ${waitSecs}s até o próximo perfil...`;
            await sleep(waitSecs * 1000);
          }
        } else {
          // Modo rápido: 15 a 30s
          const waitSecs = Math.floor(Math.random() * (30 - 15 + 1) + 15);
          logMsg.innerText = `Aguardando ${waitSecs}s até o próximo perfil...`;
          await sleep(waitSecs * 1000);
        }
      } else {
        logMsg.innerText = `[-] Falha temporária em @${target.username}. Pulando...`;
        await sleep(3000);
      }
    }

    isUnfollowing = false;
    btnStartUnfollow.classList.remove('ic-hidden');
    btnPause.classList.add('ic-hidden');
    btnStop.classList.add('ic-hidden');
    logMsg.innerText = `🎉 Finalizado! Total de ${completed} perfis removidos.`;
  });

  btnPause.addEventListener('click', () => {
    isPaused = !isPaused;
    btnPause.innerText = isPaused ? '▶️ Continuar' : '⏸️ Pausar';
    logMsg.innerText = isPaused ? 'Processo pausado.' : 'Retomando...';
  });

  btnStop.addEventListener('click', () => {
    if (confirm('Deseja interromper o processo agora?')) {
      shouldStop = true;
      isUnfollowing = false;
      btnStartUnfollow.classList.remove('ic-hidden');
      btnPause.classList.add('ic-hidden');
      btnStop.classList.add('ic-hidden');
      logMsg.innerText = 'Processo interrompido.';
    }
  });

})();
