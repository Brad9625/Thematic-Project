            // --- Simple client-side logic / placeholders ---
            const params = new URLSearchParams(location.search);
            let playerName = params.get('player') || '';
            let role = params.get('role') || 'Detective';

            // If a game code is present, try to read stored role assignments for this game
            const savedCode = params.get('game') || localStorage.getItem('gameCode') || '';

            // If no player name passed but a game exists, generate a unique player name (Player1, Player2, ...)
            if (!playerName && savedCode) {
                try {
                    const map = JSON.parse(localStorage.getItem('game::' + savedCode + '::roles') || '{}');
                    let i = 1;
                    while (map['Player' + i]) i++;
                    playerName = 'Player' + i;
                } catch (e) {
                    playerName = 'Player';
                }
            }
            if (!playerName) playerName = 'Player';
            if (savedCode) {
                try {
                    const raw = localStorage.getItem('game::' + savedCode + '::roles');
                    if (raw) {
                        const map = JSON.parse(raw);
                        if (map[playerName]) role = map[playerName];
                    }
                } catch (e) { console.error('roles load error', e); }
            }

            document.getElementById('playerName').textContent = playerName;
            document.getElementById('role').textContent = role;
    // reflect generated player name back into the URL (optional)
    if (!params.get('player')) {
        const url = new URL(window.location.href);
        url.searchParams.set('player', playerName);
        history.replaceState({}, '', url.toString());
    }
function ensureRoleForGame() {
    const code = params.get('game') || localStorage.getItem('gameCode') || '';
    if (!code) return;
    let map = {};
    try { map = JSON.parse(localStorage.getItem('game::' + code + '::roles') || '{}'); } catch (e) { map = {}; }

    // add player if not present
    if (!map[playerName]) {
        map[playerName] = 'Detective';
        localStorage.setItem('game::' + code + '::roles', JSON.stringify(map));
    }

    // helper: stronger random index (uses crypto when available)
    function cryptoRandomIndex(n) {
        if (window.crypto && window.crypto.getRandomValues) {
            const arr = new Uint32Array(1);
            window.crypto.getRandomValues(arr);
            return Math.floor((arr[0] / (0xffffffff + 1)) * n);
        }
        return Math.floor(Math.random() * n);
    }

    // if no Mr X yet and at least 2 players, pick one randomly with a re-check to reduce races
    if (!Object.values(map).includes('Mr X') && Object.keys(map).length >= 2) {
        // re-read the roles to reduce race window
        let current = {};
        try { current = JSON.parse(localStorage.getItem('game::' + code + '::roles') || '{}'); } catch (e) { current = {}; }
        if (!Object.values(current).includes('Mr X') && Object.keys(current).length >= 2) {
            const keys = Object.keys(current);
            const picked = keys[cryptoRandomIndex(keys.length)];
            const newMap = {};
            keys.forEach(k => newMap[k] = (k === picked ? 'Mr X' : 'Detective'));
            localStorage.setItem('game::' + code + '::roles', JSON.stringify(newMap));
            map = newMap;
            try { console.debug('ensureRoleForGame assigned Mr X:', picked, 'for game', code); } catch(e){}
        } else {
            // someone else already assigned Mr X
            map = current;
        }
    }

    // update local role variable if mapping contains it
    if (map[playerName]) role = map[playerName];
    document.getElementById('role').textContent = role;
}

ensureRoleForGame();

// Update tickets and UI based on role
let isMrX = /mr\.?\s?x|mrx/i.test(role);
const tickets = {
    taxi: Number(params.get('taxi')) || (isMrX ? 4 : 10),
    bus: Number(params.get('bus')) || (isMrX ? 3 : 8),
    tube: Number(params.get('tube')) || (isMrX ? 3 : 4),
    double: Number(params.get('double')) || (isMrX ? 2 : 0),
    black: Number(params.get('black')) || (isMrX ? 2 : 0),
};
function renderTickets() {
    document.getElementById('taxi').textContent = tickets.taxi;
    document.getElementById('bus').textContent = tickets.bus;
    document.getElementById('tube').textContent = tickets.tube;
    document.getElementById('double').textContent = tickets.double;
    document.getElementById('black').textContent = tickets.black;
}
renderTickets();

// show/hide Mr. X-only tickets and move options (factor into a function for reuse)
function updateMrXVisibility() {
    const doubleCard = document.querySelector('.ticket[data-type="double"]');
    const blackCard = document.querySelector('.ticket[data-type="black"]');
    const moveTypeSelect = document.getElementById('moveType');
    if (!isMrX) {
        if (doubleCard) doubleCard.style.display = 'none';
        if (blackCard) blackCard.style.display = 'none';
        if (moveTypeSelect) {
            ['double','black'].forEach(val => {
                const opt = moveTypeSelect.querySelector(`option[value="${val}"]`);
                if (opt) opt.remove();
            });
        }
    } else {
        if (doubleCard) doubleCard.style.display = 'flex';
        if (blackCard) blackCard.style.display = 'flex';
        // ensure options exist in moveTypeSelect
        if (moveTypeSelect) {
            if (!moveTypeSelect.querySelector('option[value="double"]')) {
                const opt = document.createElement('option'); opt.value = 'double'; opt.textContent = 'Double Move'; moveTypeSelect.appendChild(opt);
            }
            if (!moveTypeSelect.querySelector('option[value="black"]')) {
                const opt = document.createElement('option'); opt.value = 'black'; opt.textContent = 'Black Ticket'; moveTypeSelect.appendChild(opt);
            }
        }
    }
}

updateMrXVisibility();
// Inform the player of their role when joining (single status element)
let assignedNote = document.getElementById('assignedRoleNote');
if (!assignedNote) {
    assignedNote = document.createElement('div');
    assignedNote.id = 'assignedRoleNote';
    assignedNote.style.fontSize = '12px';
    assignedNote.style.color = '#9bff9b';
    assignedNote.style.marginTop = '6px';
    const statusContainer = document.querySelector('.phone-wrap');
    if (statusContainer) statusContainer.appendChild(assignedNote);
}
assignedNote.textContent = 'Role: ' + role;
            // WebSocket + game-code connection logic
            let ws = null;
            const statusEl = document.getElementById('status');
            const gameCodeInput = document.getElementById('gameCode');
            const copyLinkBtn = document.getElementById('copyLinkBtn');
            const connectBtn = document.getElementById('connectBtn');

            // populate game code input (if present)
            if (savedCode) gameCodeInput.value = savedCode;

            // copy invite link to clipboard
            copyLinkBtn.addEventListener('click', async () => {
                const code = (gameCodeInput.value || '').trim();
                if (!code) { statusEl.textContent = 'Enter a game code to copy link'; return; }
                const base = window.location.href.split('?')[0];
                const link = base + '?player=' + encodeURIComponent(playerName) + '&game=' + encodeURIComponent(code);
                try {
                    await navigator.clipboard.writeText(link);
                    statusEl.textContent = 'Invite link copied';
                } catch (e) {
                    // fallback
                    window.prompt('Copy this link', link);
                }
            });

            // connect / join logic
            connectBtn.addEventListener('click', () => {
                if (ws && ws.readyState === WebSocket.OPEN) { ws.close(); connectBtn.textContent = 'Join Game'; return; }

                const code = (gameCodeInput.value || '').trim();
                if (!code) { statusEl.textContent = 'Enter a game code'; return; }
                localStorage.setItem('gameCode', code);

                // TODO: set your server URL here
                const url = 'ws://localhost:3000/game?player=' + encodeURIComponent(playerName) + '&code=' + encodeURIComponent(code);
                ws = new WebSocket(url);
                statusEl.textContent = 'Connecting...';

                ws.addEventListener('open', () => {
                    statusEl.textContent = 'Connected to ' + code;
                    connectBtn.textContent = 'Disconnect';
                });
                ws.addEventListener('close', () => {
                    statusEl.textContent = 'Disconnected';
                    connectBtn.textContent = 'Join Game';
                });
                ws.addEventListener('error', () => {
                    statusEl.textContent = 'Connection error';
                });

                ws.addEventListener('message', (ev) => {
                    try {
                        const msg = JSON.parse(ev.data);
                        // server messages:
                        // { type: 'update', location: 45, tickets: {...} }
                        // { type: 'joined', game: 'ABC123' }
                        // { type: 'error', message: 'invalid code' }
                        if (msg.type === 'update') {
                            if (msg.location !== undefined) document.getElementById('locationDisplay').textContent = msg.location;
                            if (msg.tickets) Object.assign(tickets, msg.tickets), renderTickets();
                        } else if (msg.type === 'joined') {
                            statusEl.textContent = 'Joined game ' + (msg.game || '');
                        } else if (msg.type === 'error') {
                            statusEl.textContent = 'Error: ' + (msg.message || '');
                        }
                    } catch (e) { console.error(e); }
                });
            });

            // Send move
            document.getElementById('confirmMove').addEventListener('click', () => {
                const moveType = document.getElementById('moveType').value;
                const dest = Number(document.getElementById('destination').value);
                if (!dest) { alert('Enter a destination node number.'); return; }
                const payload = { type: 'move', moveType, destination: dest };
                if (ws && ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify(payload));
                    statusEl.textContent = 'Move sent';
                } else {
                    // fallback: store in localStorage or simulate
                    console.log('Move (simulated):', payload);
                    statusEl.textContent = 'Move queued (offline)';
                }
            });

            // Optional: allow pressing Enter to submit destination
            document.getElementById('destination').addEventListener('keydown', (e) => {
                if (e.key === 'Enter') document.getElementById('confirmMove').click();
            });

            // Notes box: autosave to localStorage per player+game
            const notesEl = document.getElementById('playerNotes');
            const clearNotesBtn = document.getElementById('clearNotesBtn');
            const notesStatus = document.getElementById('notesStatus');

            function getNotesKey() {
                const code = (gameCodeInput && gameCodeInput.value && gameCodeInput.value.trim()) || params.get('game') || localStorage.getItem('gameCode') || 'global';
                return 'notes::' + code + '::' + playerName;
            }

            // load notes
            if (notesEl) {
                const savedNotes = localStorage.getItem(getNotesKey());
                if (savedNotes) notesEl.value = savedNotes;

                if (!notesEl.__notesInit) {
                    notesEl.__notesInit = true;
                    let saveTimer = null;
                    notesEl.addEventListener('input', () => {
                        notesStatus.textContent = 'Saving...';
                        if (saveTimer) clearTimeout(saveTimer);
                        saveTimer = setTimeout(() => {
                            localStorage.setItem(getNotesKey(), notesEl.value);
                            notesStatus.textContent = 'Notes saved locally';
                        }, 500);
                    });

                    clearNotesBtn.addEventListener('click', () => {
                        if (!confirm('Clear your notes?')) return;
                        notesEl.value = '';
                        localStorage.removeItem(getNotesKey());
                        notesStatus.textContent = 'Notes cleared';
                        setTimeout(() => notesStatus.textContent = 'Notes saved locally', 1200);
                    });
                }
            }
