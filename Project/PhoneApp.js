            // --- Simple client-side logic / placeholders ---
            const params = new URLSearchParams(location.search);
            const playerName = params.get('player') || 'Player';
            const role = params.get('role') || 'Detective';
            document.getElementById('playerName').textContent = playerName;
            document.getElementById('role').textContent = role;

            // Example: load ticket counts from query or defaults
            const tickets = {
                taxi: Number(params.get('taxi')) || (role === 'MrX' ? 4 : 10),
                bus: Number(params.get('bus')) || (role === 'MrX' ? 3 : 8),
                tube: Number(params.get('tube')) || (role === 'MrX' ? 3 : 4),
                double: Number(params.get('double')) || (role === 'MrX' ? 2 : 0),
                black: Number(params.get('black')) || (role === 'MrX' ? 2 : 0),
            };
            function renderTickets() {
                document.getElementById('taxi').textContent = tickets.taxi;
                document.getElementById('bus').textContent = tickets.bus;
                document.getElementById('tube').textContent = tickets.tube;
                document.getElementById('double').textContent = tickets.double;
                document.getElementById('black').textContent = tickets.black;
            }
            renderTickets();

            // WebSocket + game-code connection logic
            let ws = null;
            const statusEl = document.getElementById('status');
            const gameCodeInput = document.getElementById('gameCode');
            const copyLinkBtn = document.getElementById('copyLinkBtn');
            const connectBtn = document.getElementById('connectBtn');

            // populate game code from URL or localStorage
            const savedCode = params.get('game') || localStorage.getItem('gameCode') || '';
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