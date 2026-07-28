
// ── MOBILE NAV TOGGLE ──────────────────────────────────────────────────────
(function() {
    const toggle = document.getElementById('navToggle');
    const nav    = document.getElementById('mainNav');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', () => nav.classList.toggle('open'));
    document.addEventListener('click', e => {
        if (!toggle.contains(e.target) && !nav.contains(e.target)) {
            nav.classList.remove('open');
        }
    });
})();

// ── FOOTER YEAR ─────────────────────────────────────────────────────────────
(function() {
    const el = document.getElementById('footer-year');
    if (el) el.textContent = new Date().getFullYear();
})();



        // ============================================================
        //  DATA
        // ============================================================

        const MOVE_GUIDES = [{
            id: 'daily-reset',
            title: '5-Minute Daily Reset',
            icon: 'fa-sun',
            desc: 'Quick morning or evening reset for the whole body.',
            totalMins: 5,
            moves: [
                { name: 'Foam Roll — Upper Back', tool: 'Foam Roller', work: 20, rest: 10 },
                { name: 'Foam Roll — Glutes', tool: 'Foam Roller', work: 20, rest: 10 },
                { name: 'Spiky Ball — Shoulders', tool: 'Spiky Ball', work: 20, rest: 10 },
                { name: 'Lacrosse Ball — Feet', tool: 'Lacrosse Ball', work: 20, rest: 10 },
                { name: 'Band — Shoulder Stretch', tool: 'Resistance Band', work: 20, rest: 10 },
                { name: 'Band — Chest Opener', tool: 'Resistance Band', work: 20, rest: 10 },
            ]
        }, {
            id: 'desk-reset',
            title: 'Desk / Commuter Reset',
            icon: 'fa-chair',
            desc: 'Relieve tension from sitting. Perfect for office or commute.',
            totalMins: 6,
            moves: [
                { name: 'Neck Stretch', tool: '—', work: 15, rest: 8 },
                { name: 'Shoulder Rolls', tool: '—', work: 15, rest: 8 },
                { name: 'Foam Roll — Mid Back', tool: 'Foam Roller', work: 20, rest: 10 },
                { name: 'Spiky Ball — Forearms', tool: 'Spiky Ball', work: 20, rest: 10 },
                { name: 'Band — Chest Fly', tool: 'Resistance Band', work: 20, rest: 10 },
                { name: 'Hip Flexor Stretch', tool: '—', work: 20, rest: 10 },
                { name: 'Glute Bridge', tool: '—', work: 20, rest: 10 },
            ]
        }, {
            id: 'post-workout',
            title: 'Post-Workout Recovery',
            icon: 'fa-dumbbell',
            desc: 'Cool down and recover after any workout.',
            totalMins: 7,
            moves: [
                { name: 'Foam Roll — Quads', tool: 'Foam Roller', work: 25, rest: 10 },
                { name: 'Foam Roll — Calves', tool: 'Foam Roller', work: 25, rest: 10 },
                { name: 'Massage Stick — IT Band', tool: 'Massage Stick', work: 25, rest: 10 },
                { name: 'Double Ball — Lower Back', tool: 'Double Ball', work: 25, rest: 10 },
                { name: 'Band — Hamstring Stretch', tool: 'Resistance Band', work: 25, rest: 10 },
                { name: 'Band — Quad Stretch', tool: 'Resistance Band', work: 25, rest: 10 },
                { name: 'Deep Breathing', tool: '—', work: 20, rest: 0 },
            ]
        }];
        // ============================================================
        // – TIMER ENGINE
        // ============================================================

        let timerState = {
            guideId: 'daily-reset',
            moveIndex: 0,
            phase: 'work', // 'work' | 'rest'
            timeRemaining: 0,
            isRunning: false,
            isPaused: false,
            completed: false,
        };

        let timerInterval = null;

        function getGuide(id) {
            return MOVE_GUIDES.find(g => g.id === id) || MOVE_GUIDES[0];
        }

        function getMove(guide, index) {
            return guide.moves[index] || guide.moves[0];
        }

        function saveState() {
            try {
                localStorage.setItem('yuvotimer_state', JSON.stringify(timerState));
            } catch (_) {}
        }

        function loadState() {
            try {
                const raw = localStorage.getItem('yuvotimer_state');
                if (raw) {
                    const parsed = JSON.parse(raw);
                    // validate guide still exists
                    const guide = getGuide(parsed.guideId);
                    if (guide && parsed.moveIndex < guide.moves.length) {
                        Object.assign(timerState, parsed);
                        return true;
                    }
                }
            } catch (_) {}
            return false;
        }

        function renderMoveGuide(guideId) {
            const guide = getGuide(guideId);
            timerState.guideId = guideId;

            // try load saved state, but if guide mismatch, reset
            const loaded = loadState();
            if (!loaded || timerState.guideId !== guideId) {
                // reset to first move
                timerState.moveIndex = 0;
                timerState.phase = 'work';
                timerState.timeRemaining = guide.moves[0].work;
                timerState.isRunning = false;
                timerState.isPaused = false;
                timerState.completed = false;
                saveState();
            } else {
                // ensure timeRemaining is valid
                const move = getMove(guide, timerState.moveIndex);
                if (timerState.phase === 'work') {
                    timerState.timeRemaining = move.work;
                } else {
                    timerState.timeRemaining = move.rest;
                }
            }

            // set title
            document.getElementById('guideTitle').textContent = guide.title;

            // render move list
            renderMoveList(guide);

            // update display
            updateTimerDisplay(guide);

            // clear any running interval
            if (timerInterval) {
                clearInterval(timerInterval);
                timerInterval = null;
            }

            // if state says running, restart tick
            if (timerState.isRunning && !timerState.isPaused && !timerState.completed) {
                startTick();
            } else {
                // ensure play button shows correct state
                const playBtn = document.getElementById('timerPlayBtn');
                if (playBtn) {
                    if (timerState.isPaused) {
                        playBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
                    } else {
                        playBtn.innerHTML = '<i class="fas fa-play"></i> Play';
                    }
                }
            }
        }

        function renderMoveList(guide) {
            const ul = document.getElementById('moveListSide');
            if (!ul) return;
            ul.innerHTML = guide.moves.map((m, i) => {
                let cls = '';
                let icon = '';
                if (i < timerState.moveIndex) { cls = 'completed';
                    icon = '✓'; } else if (i === timerState.moveIndex) { cls = 'active';
                    icon = '▶'; }
                return `<li class="${cls}">
                            <span class="li-index">${i + 1}</span>
                            <span>${m.name}</span>
                            <span class="li-tool">${m.tool}</span>
                        </li>`;
            }).join('');
        }

        function updateTimerDisplay(guide) {
            const move = getMove(guide, timerState.moveIndex);
            const phaseLabel = document.getElementById('phaseLabel');
            const timerDisplay = document.getElementById('timerDisplay');
            const moveName = document.getElementById('moveName');
            const moveTool = document.getElementById('moveTool');
            const progressFill = document.getElementById('progressFill');
            const progressStep = document.getElementById('progressStep');
            const progressPct = document.getElementById('progressPct');

            // phase
            phaseLabel.textContent = timerState.phase === 'work' ? 'WORK' : 'REST';
            phaseLabel.style.color = timerState.phase === 'work' ? 'var(--blue)' : 'var(--red)';

            // time
            const secs = Math.max(0, timerState.timeRemaining);
            timerDisplay.textContent = String(secs).padStart(2, '0');

            // move info
            moveName.textContent = move.name;
            moveTool.textContent = move.tool || '—';

            // progress
            const totalMoves = guide.moves.length;
            const done = timerState.completed ? totalMoves : timerState.moveIndex;
            const pct = totalMoves > 0 ? (done / totalMoves) * 100 : 0;
            progressFill.style.width = Math.min(100, pct) + '%';
            progressStep.textContent = `${done} / ${totalMoves}`;
            progressPct.textContent = Math.round(pct) + '%';

            // if completed
            if (timerState.completed) {
                phaseLabel.textContent = 'DONE 🎉';
                timerDisplay.textContent = '00';
                moveName.textContent = 'All done! Great work.';
                moveTool.textContent = '—';
                progressFill.style.width = '100%';
                progressStep.textContent = `${totalMoves} / ${totalMoves}`;
                progressPct.textContent = '100%';
                // stop running
                if (timerInterval) {
                    clearInterval(timerInterval);
                    timerInterval = null;
                }
                timerState.isRunning = false;
                timerState.isPaused = false;
                document.getElementById('timerPlayBtn').innerHTML = '<i class="fas fa-play"></i> Play';
            }

            // highlight active in list
            document.querySelectorAll('#moveListSide li').forEach((li, idx) => {
                li.classList.remove('active', 'completed');
                if (idx < timerState.moveIndex) li.classList.add('completed');
                if (idx === timerState.moveIndex && !timerState.completed) li.classList.add('active');
            });

            saveState();
        }

        function startTick() {
            if (timerInterval) clearInterval(timerInterval);
            timerInterval = setInterval(() => {
                const guide = getGuide(timerState.guideId);
                if (!guide) return;

                if (timerState.isPaused || timerState.completed) return;

                // decrement time
                timerState.timeRemaining -= 1;

                // check if time's up
                if (timerState.timeRemaining <= 0) {
                    // move to next phase or move
                    const move = getMove(guide, timerState.moveIndex);
                    if (timerState.phase === 'work') {
                        // switch to rest if rest > 0
                        if (move.rest > 0) {
                            timerState.phase = 'rest';
                            timerState.timeRemaining = move.rest;
                        } else {
                            // no rest, skip to next move
                            advanceToNextMove(guide);
                        }
                    } else {
                        // rest finished, advance to next move
                        advanceToNextMove(guide);
                    }
                    // re-render list
                    renderMoveList(guide);
                }

                updateTimerDisplay(guide);

                // if completed, stop interval
                if (timerState.completed) {
                    clearInterval(timerInterval);
                    timerInterval = null;
                    document.getElementById('timerPlayBtn').innerHTML = '<i class="fas fa-play"></i> Play';
                }
            }, 1000);
        }

        function advanceToNextMove(guide) {
            const nextIdx = timerState.moveIndex + 1;
            if (nextIdx < guide.moves.length) {
                timerState.moveIndex = nextIdx;
                timerState.phase = 'work';
                timerState.timeRemaining = guide.moves[nextIdx].work;
            } else {
                // completed!
                timerState.completed = true;
                timerState.isRunning = false;
                timerState.isPaused = false;
                if (timerInterval) {
                    clearInterval(timerInterval);
                    timerInterval = null;
                }
            }
            renderMoveList(guide);
        }

        // ---- Timer Controls ----

        document.addEventListener('click', function(e) {
            const target = e.target.closest('button');
            if (!target) return;

            const guide = getGuide(timerState.guideId);
            if (!guide) return;

            const playBtn = document.getElementById('timerPlayBtn');
            const pauseBtn = document.getElementById('timerPauseBtn');
            const skipBtn = document.getElementById('timerSkipBtn');
            const restartBtn = document.getElementById('timerRestartBtn');

            // Play / Resume
            if (target.id === 'timerPlayBtn' || target.closest('#timerPlayBtn')) {
                e.preventDefault();
                if (timerState.completed) {
                    // restart if completed
                    resetTimer(guide);
                    return;
                }
                timerState.isRunning = true;
                timerState.isPaused = false;
                if (!timerInterval) {
                    startTick();
                }
                playBtn.innerHTML = '<i class="fas fa-play"></i> Playing…';
                saveState();
            }

            // Pause
            if (target.id === 'timerPauseBtn' || target.closest('#timerPauseBtn')) {
                e.preventDefault();
                if (timerState.isRunning && !timerState.isPaused && !timerState.completed) {
                    timerState.isPaused = true;
                    if (timerInterval) {
                        clearInterval(timerInterval);
                        timerInterval = null;
                    }
                    playBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
                    saveState();
                }
            }

            // Skip
            if (target.id === 'timerSkipBtn' || target.closest('#timerSkipBtn')) {
                e.preventDefault();
                if (timerState.completed) return;
                // if in rest, just go to next move
                if (timerState.phase === 'rest') {
                    advanceToNextMove(guide);
                } else {
                    // skip current move — mark as done and advance
                    advanceToNextMove(guide);
                }
                renderMoveList(guide);
                updateTimerDisplay(guide);
                // if interval running, keep going
                if (timerState.isRunning && !timerState.isPaused && !timerState.completed) {
                    if (!timerInterval) startTick();
                }
                saveState();
            }

            // Restart
            if (target.id === 'timerRestartBtn' || target.closest('#timerRestartBtn')) {
                e.preventDefault();
                resetTimer(guide);
            }
        });

        function resetTimer(guide) {
            if (timerInterval) {
                clearInterval(timerInterval);
                timerInterval = null;
            }
            timerState.moveIndex = 0;
            timerState.phase = 'work';
            timerState.timeRemaining = guide.moves[0].work;
            timerState.isRunning = false;
            timerState.isPaused = false;
            timerState.completed = false;
            renderMoveList(guide);
            updateTimerDisplay(guide);
            document.getElementById('timerPlayBtn').innerHTML = '<i class="fas fa-play"></i> Play';
            saveState();
        }

        

        

        console.log('🏋️ YUVO Fitness · Move Freely. Live Fully.');
        console.log('💪 Timer state persists in localStorage — close tab & resume anytime.');

// ── MOVEMENT HUB: render move cards ──────────────────────────────────────────
(function renderMoveHub() {
    const grid = document.getElementById('moveGrid');
    if (!grid) return;
    grid.innerHTML = MOVE_GUIDES.map(g => `
        <a href="moveguide.html" class="move-card" onclick="sessionStorage.setItem('yuvotimer_guideId','${g.id}')">
            <div class="move-icon"><i class="fas ${g.icon}"></i></div>
            <h3>${g.title}</h3>
            <p>${g.desc}</p>
            <div class="move-meta">
                <span><i class="fas fa-clock"></i> ${g.totalMins} min</span>
                <span><i class="fas fa-list-ul"></i> ${g.moves.length} moves</span>
            </div>
        </a>
    `).join('');
})();

// ── MOVEGUIDE: on page load, auto-render if on moveguide page ───────────────
(function() {
    const section = document.getElementById('page-moveguide');
    if (!section) return;
    const guideId = sessionStorage.getItem('yuvotimer_guideId') || 'daily-reset';
    if (typeof renderMoveGuide === 'function') renderMoveGuide(guideId);
})();

    