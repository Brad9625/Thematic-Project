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