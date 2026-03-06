    const rulesBtn = document.getElementById("rulesBtn");
    const modal = document.getElementById("rulesModal");
    const closeBtn = document.getElementById("rulesCloseBtn");

    function openRules() {
      modal.classList.add("open");
      modal.setAttribute("aria-hidden", "false");
    }

    function closeRules() {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
    }

    rulesBtn.addEventListener("click", openRules);
    closeBtn.addEventListener("click", closeRules);

    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeRules();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("open")) closeRules();
    });

    // --- New Game / Game Code modal logic ---
    const newGameBtn = document.getElementById('newGameBtn');
    const gameModal = document.getElementById('gameCodeModal');
    const gameCloseBtn = document.getElementById('gameCodeCloseBtn');
    const gameCodeText = document.getElementById('gameCodeText');
    const copyGameLinkBtn = document.getElementById('copyGameLinkBtn');
    const copyGameCodeBtn = document.getElementById('copyGameCodeBtn');
    const gameQr = document.getElementById('gameQr');

    function openGameModal() {
      gameModal.classList.add('open');
      gameModal.setAttribute('aria-hidden', 'false');
    }

    function closeGameModal() {
      gameModal.classList.remove('open');
      gameModal.setAttribute('aria-hidden', 'true');
    }

    function generateGameCode(length = 6) {
      const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
      let result = '';
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    }

    newGameBtn.addEventListener('click', () => {
      const code = generateGameCode();
      gameCodeText.textContent = code;
      const base = window.location.origin + window.location.pathname;
      const link = base + '?game=' + encodeURIComponent(code);
      // generate QR code via public API
      gameQr.src = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + encodeURIComponent(link);
      localStorage.setItem('currentGameCode', code);
      openGameModal();
      // show roles panel (empty initially)
      displayRoles(code);
    });

    gameCloseBtn.addEventListener('click', closeGameModal);
    gameModal.addEventListener('click', (e) => { if (e.target === gameModal) closeGameModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && gameModal.classList.contains('open')) closeGameModal(); });

    copyGameLinkBtn.addEventListener('click', async () => {
      const code = gameCodeText.textContent;
      const base = window.location.origin + window.location.pathname;
      const link = base + '?game=' + encodeURIComponent(code);
      try {
        await navigator.clipboard.writeText(link);
        alert('Invite link copied to clipboard');
      } catch (e) {
        window.prompt('Copy link', link);
      }
    });

    copyGameCodeBtn.addEventListener('click', async () => {
      const code = gameCodeText.textContent;
      try {
        await navigator.clipboard.writeText(code);
        alert('Game code copied to clipboard');
      } catch (e) {
        window.prompt('Copy code', code);
      }
    });

    // Roles assignment helpers
    const assignPlayersBtn = document.getElementById('assignPlayersBtn');
    const randomizeRolesBtn = document.getElementById('randomizeRolesBtn');
    const playerListEl = document.getElementById('playerList');

    // Game Info elements
    const gameInfoBtn = document.getElementById('gameInfoBtn');
    const gameInfoModal = document.getElementById('gameInfoModal');
    const gameInfoCloseBtn = document.getElementById('gameInfoCloseBtn');
    const gameInfoCode = document.getElementById('gameInfoCode');
    const gameInfoPlayers = document.getElementById('gameInfoPlayers');

    function getRolesKey(code) {
      return 'game::' + code + '::roles';
    }

    function escapeHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

    function displayRoles(code, targetEl) {
      // prefer explicit code, then currentGameCode, then URL param, then modal text
      code = code || localStorage.getItem('currentGameCode') || (new URLSearchParams(window.location.search)).get('game') || gameCodeText.textContent;
      const outEl = targetEl || playerListEl;
      if (!code) { outEl.innerHTML = '<em>No game code set.</em>'; return; }
      const raw = localStorage.getItem(getRolesKey(code));
      if (!raw) { outEl.innerHTML = '<em>No players assigned yet.</em>'; return; }
      try {
        const map = JSON.parse(raw);
        const rows = Object.entries(map).map(([name, role]) => `
          <tr>
            <td style="padding:6px;border-bottom:1px solid rgba(255,255,255,0.08)">${escapeHtml(name)}</td>
            <td style="padding:6px;border-bottom:1px solid rgba(255,255,255,0.08)"><strong>${escapeHtml(role)}</strong></td>
          </tr>
        `).join('');
        outEl.innerHTML = `
          <table class="players-table" style="width:100%;border-collapse:collapse;color:linen;font-family:'Lucida Console', monospace;">
            <thead><tr><th style="text-align:left;padding:6px;border-bottom:1px solid rgba(255,255,255,0.12)">Name</th><th style="text-align:left;padding:6px;border-bottom:1px solid rgba(255,255,255,0.12)">Role</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        `;
      } catch (e) {
        outEl.textContent = 'Error loading players';
      }
    }

    assignPlayersBtn.addEventListener('click', () => {
      let code = localStorage.getItem('currentGameCode') || gameCodeText.textContent;
      if (!code) { alert('Create a game first.'); return; }
      const input = prompt('Enter player names, comma separated (e.g. Alice,Bob,Charlie):');
      if (!input) return;
      const names = input.split(',').map(s => s.trim()).filter(Boolean);
      if (!names.length) return alert('No valid names provided');
      const roles = {};
      names.forEach(n => { roles[n] = 'Detective'; });
      localStorage.setItem(getRolesKey(code), JSON.stringify(roles));
      displayRoles(code);
      if (gameInfoPlayers) displayRoles(code, gameInfoPlayers);
      alert('Players assigned. Use Randomize Roles to pick Mr. X');
    });

    randomizeRolesBtn.addEventListener('click', () => {
      let code = localStorage.getItem('currentGameCode') || gameCodeText.textContent;
      if (!code) { alert('Create a game first.'); return; }
      let raw = localStorage.getItem(getRolesKey(code));
      let names = [];
      if (raw) {
        try { names = Object.keys(JSON.parse(raw)); } catch (e) { names = []; }
      }
      if (!names.length) {
        const input = prompt('No player list found. Enter player names, comma separated:');
        if (!input) return; names = input.split(',').map(s => s.trim()).filter(Boolean);
        if (!names.length) return alert('No valid names provided');
      }
      const picked = names[Math.floor(Math.random()*names.length)];
      const roles = {};
      names.forEach(n => { roles[n] = (n === picked ? 'Mr X' : 'Detective'); });
      localStorage.setItem(getRolesKey(code), JSON.stringify(roles));
      displayRoles(code);
      if (gameInfoPlayers) displayRoles(code, gameInfoPlayers);
      alert('Mr. X selected: ' + picked);
    });

    // ensure the modal shows roles if already present
    // (handled in main newGame handler)

    // when opening modal manually, show roles
    gameCodeModal.addEventListener('click', () => { const code = gameCodeText.textContent; if (code) displayRoles(code); });

    // Game Info button handlers
    if (gameInfoBtn) {
      gameInfoBtn.addEventListener('click', () => {
        const code = localStorage.getItem('currentGameCode') || gameCodeText.textContent;
        if (!code) { alert('Create a game first.'); return; }
        gameInfoCode.textContent = code;
        gameInfoModal.classList.add('open');
        gameInfoModal.setAttribute('aria-hidden', 'false');
        displayRoles(code, gameInfoPlayers);
      });
      gameInfoCloseBtn.addEventListener('click', () => { gameInfoModal.classList.remove('open'); gameInfoModal.setAttribute('aria-hidden', 'true'); });
      gameInfoModal.addEventListener('click', (e) => { if (e.target === gameInfoModal) { gameInfoModal.classList.remove('open'); gameInfoModal.setAttribute('aria-hidden', 'true'); } });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && gameInfoModal.classList.contains('open')) { gameInfoModal.classList.remove('open'); gameInfoModal.setAttribute('aria-hidden', 'true'); } });
    }

    // update roles display when localStorage roles change (e.g., players joining from other tabs)
    window.addEventListener('storage', (e) => {
      if (!e.key) return;
      const m = (e.key || '').match(/^game::(.+)::roles$/);
      if (m) {
        const changedCode = m[1];
        const current = localStorage.getItem('currentGameCode') || (new URLSearchParams(window.location.search)).get('game') || gameCodeText.textContent;
        if (changedCode === current) {
          displayRoles(changedCode);
          if (gameInfoPlayers) displayRoles(changedCode, gameInfoPlayers);
        }
      }
    });

    // on load, show current game roles if available
    const initialCode = localStorage.getItem('currentGameCode') || (new URLSearchParams(window.location.search)).get('game');
    if (initialCode) {
      displayRoles(initialCode);
      if (gameInfoBtn) gameInfoBtn.disabled = false;
    }

    // Join on TV button: open PhoneApp.html with player and game code
    const joinFromTVBtn = document.getElementById('joinFromTVBtn');
    if (joinFromTVBtn) {
      joinFromTVBtn.addEventListener('click', async () => {
        let code = localStorage.getItem('currentGameCode') || params.get('game') || '';
        if (!code) {
          // create a new game code if none exists
          newGameBtn.click();
          code = localStorage.getItem('currentGameCode') || '';
          if (!code) { alert('Could not create a game code'); return; }
        }
        const player = prompt('Enter player name for phone (optional):') || 'Player';
        const relLink = 'PhoneApp.html?player=' + encodeURIComponent(player) + '&game=' + encodeURIComponent(code);
        // copy link & open
        const fullLink = window.location.origin + window.location.pathname.replace(/[^/]*$/,'') + relLink;
        try {
          await navigator.clipboard.writeText(fullLink);
          alert('Join link copied to clipboard. Opening Phone App in a new tab.');
        } catch (e) {
          // ignore clipboard errors
        }
        window.open(relLink, '_blank');
      });

      const darkModeToggle = document.getElementById('darkModeBtn');

      if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
          document.documentElement.classList.toggle('dark');
        });
      }
    }