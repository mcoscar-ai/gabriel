// ============================================================
// screens.js — Telas do jogo: intro, título, game over, vitória
// Estados: 'intro' → 'title' → 'playing' → 'gameover' / 'win'
// Requer: assets.js, player.js, enemies.js
// ============================================================

var GAME_STATE = 'intro'; // estado inicial

// ============================================================
// INTRO — Gabriel no quarto contando a história
// ============================================================
var INTRO = {
  lines: [
    'Penha, Santa Catarina.',
    'Sábado, 23:30...',
    '',
    'Gabriel tem 11 anos e é um hacker genial.',
    'Naquela noite, ele descobriu algo que',
    'mudaria o destino do Brasil para sempre.',
    '',
    'A empresa americana NEXCORP planeja',
    'transformar o Beto Carrero World em',
    'um laboratório secreto de Inteligência',
    'Artificial para atacar todos os servidores',
    'do Brasil e iniciar a 3ª Guerra Mundial.',
    '',
    'Gabriel tentou avisar a polícia...',
    'O governo... Ninguém acreditou.',
    '',
    '[ Ele terá que resolver sozinho. ]',
  ],
  currentLine: 0,   // linha atual sendo digitada
  currentChar: 0,   // caractere atual na linha
  charTimer:   0,   // timer para digitar próximo char
  lineTimer:   0,   // timer para avançar linha
  done:        false,
  skipPressed: false,
};

function updateIntro(){
  if(INTRO.done) return;

  INTRO.charTimer++;

  // Digita um caractere a cada 2 frames
  if(INTRO.charTimer >= 2){
    INTRO.charTimer = 0;
    var line = INTRO.lines[INTRO.currentLine];

    if(INTRO.currentChar < line.length){
      INTRO.currentChar++;
    } else {
      // Linha completa — pausa antes da próxima
      INTRO.lineTimer++;
      if(INTRO.lineTimer >= 40){
        INTRO.lineTimer = 0;
        INTRO.currentLine++;
        INTRO.currentChar = 0;

        if(INTRO.currentLine >= INTRO.lines.length){
          INTRO.done = true;
        }
      }
    }
  }
}

function drawIntro(ctx, W, H){
  var bg = IMGS['screen_room'];
  if(bg){
    // Escala mantendo proporção
    var scale = Math.max(W/bg.width, H/bg.height);
    var dw = Math.round(bg.width  * scale);
    var dh = Math.round(bg.height * scale);
    ctx.drawImage(bg, Math.round((W-dw)/2), Math.round((H-dh)/2), dw, dh);
  } else {
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, W, H);
  }

  // Overlay escuro para legibilidade
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(0, 0, W, H);

  // Caixa de texto estilo terminal
  var boxX = 40, boxY = H - 200, boxW = W - 80, boxH = 175;
  ctx.fillStyle = 'rgba(0,0,0,0.75)';
  ctx.fillRect(boxX, boxY, boxW, boxH);
  ctx.strokeStyle = 'rgba(0,255,136,0.6)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(boxX, boxY, boxW, boxH);

  // Título
  ctx.fillStyle = '#00FF88';
  ctx.font = 'bold 11px "Courier New", monospace';
  ctx.fillText('> GABRIEL_SHADOW_CIRCUIT.exe', boxX + 12, boxY + 18);
  ctx.fillStyle = 'rgba(0,255,136,0.3)';
  ctx.fillRect(boxX, boxY + 22, boxW, 1);

  // Linhas da história
  ctx.font = '12px "Courier New", monospace';
  var visibleLines = 8;
  var startLine    = Math.max(0, INTRO.currentLine - visibleLines + 1);

  for(var i = 0; i < visibleLines; i++){
    var lineIdx = startLine + i;
    if(lineIdx >= INTRO.lines.length) break;

    var text = INTRO.lines[lineIdx];
    if(lineIdx === INTRO.currentLine){
      text = text.substring(0, INTRO.currentChar);
    }

    // Cor diferente para linhas especiais
    if(text.indexOf('[') !== -1){
      ctx.fillStyle = '#FFD700';
    } else if(text.indexOf('NEXCORP') !== -1 || text.indexOf('Guerra') !== -1){
      ctx.fillStyle = '#FF5050';
    } else if(text === ''){
      ctx.fillStyle = 'transparent';
    } else {
      ctx.fillStyle = '#CCCCCC';
    }

    ctx.fillText(text, boxX + 12, boxY + 40 + i * 16);

    // Cursor piscando na linha atual
    if(lineIdx === INTRO.currentLine && Math.floor(Date.now()/400)%2===0){
      var tw = ctx.measureText(text).width;
      ctx.fillStyle = '#00FF88';
      ctx.fillRect(boxX + 12 + tw, boxY + 28 + i * 16, 7, 13);
    }
  }

  // Instrução para pular
  if(Math.floor(Date.now()/600)%2===0){
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px "Courier New", monospace';
    ctx.textAlign = 'right';
    ctx.fillText('ENTER / TOQUE para pular', W - 12, H - 8);
    ctx.textAlign = 'left';
  }
}

// ============================================================
// TÍTULO — Gabriel de costas olhando o Beto Carrero
// ============================================================
var TITLE = {
  alpha:     0,    // fade in
  glitchTimer: 0,
};

function updateTitle(){
  if(TITLE.alpha < 1) TITLE.alpha = Math.min(1, TITLE.alpha + 0.02);
  TITLE.glitchTimer++;
}

function drawTitle(ctx, W, H){
  var bg = IMGS['screen_title'];
  if(bg){
    var scale = Math.max(W/bg.width, H/bg.height);
    var dw = Math.round(bg.width  * scale);
    var dh = Math.round(bg.height * scale);
    ctx.globalAlpha = TITLE.alpha;
    ctx.drawImage(bg, Math.round((W-dw)/2), Math.round((H-dh)/2), dw, dh);
    ctx.globalAlpha = 1;
  } else {
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, W, H);
  }

  // Overlay leve
  ctx.fillStyle = 'rgba(0,0,10,0.4)';
  ctx.fillRect(0, 0, W, H);

  // Título do jogo
  ctx.textAlign = 'center';

  // Sombra
  ctx.fillStyle = 'rgba(0,0,0,0.8)';
  ctx.font = 'bold 32px "Courier New", monospace';
  ctx.fillText('GABRIEL', W/2 + 2, 62);
  ctx.font = 'bold 14px "Courier New", monospace';
  ctx.fillText('SHADOW CIRCUIT', W/2 + 1, 83);

  // Efeito glitch ocasional
  var glitch = (TITLE.glitchTimer % 180 < 4);
  ctx.fillStyle = glitch ? '#FF0044' : '#00FF88';
  ctx.font = 'bold 32px "Courier New", monospace';
  ctx.fillText('GABRIEL', W/2 + (glitch?2:0), 60);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 14px "Courier New", monospace';
  ctx.fillText('SHADOW CIRCUIT', W/2, 82);

  // "Pressione para começar" piscando
  if(Math.floor(Date.now()/500)%2===0){
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 12px "Courier New", monospace';
    ctx.fillText('▶  PRESSIONE ENTER OU TOQUE PARA COMEÇAR  ◀', W/2, H - 30);
  }

  // Versão
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.font = '9px "Courier New", monospace';
  ctx.fillText('v1.0 — GABRIEL: SHADOW CIRCUIT', W/2, H - 10);

  ctx.textAlign = 'left';
}

// ============================================================
// GAME OVER
// ============================================================
var GAMEOVER = {
  timer:     0,
  showRetry: false,
};

function updateGameOver(){
  GAMEOVER.timer++;
  if(GAMEOVER.timer > 150) GAMEOVER.showRetry = true;
}

function drawGameOver(ctx, W, H){
  var bg = IMGS['screen_gameover'];
  if(bg){
    var scale = Math.max(W/bg.width, H/bg.height);
    var dw = Math.round(bg.width  * scale);
    var dh = Math.round(bg.height * scale);
    ctx.drawImage(bg, Math.round((W-dw)/2), Math.round((H-dh)/2), dw, dh);
  } else {
    ctx.fillStyle = '#0a0005';
    ctx.fillRect(0, 0, W, H);
  }

  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = 'center';

  // GAME OVER com efeito vermelho
  ctx.fillStyle = 'rgba(0,0,0,0.8)';
  ctx.font = 'bold 48px "Courier New", monospace';
  ctx.fillText('GAME OVER', W/2 + 3, H/2 - 28);

  ctx.fillStyle = '#FF2222';
  ctx.font = 'bold 48px "Courier New", monospace';
  ctx.fillText('GAME OVER', W/2, H/2 - 30);

  // Score final
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 14px "Courier New", monospace';
  ctx.fillText('SCORE FINAL: ' + P.score.toString().padStart(8,'0'), W/2, H/2 + 10);

  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = '11px "Courier New", monospace';
  ctx.fillText('A NEXCORP venceu... por enquanto.', W/2, H/2 + 32);

  // Retry
  if(GAMEOVER.showRetry && Math.floor(Date.now()/500)%2===0){
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 12px "Courier New", monospace';
    ctx.fillText('▶  PRESSIONE ENTER OU TOQUE PARA TENTAR NOVAMENTE  ◀', W/2, H - 30);
  }

  ctx.textAlign = 'left';
}

// ============================================================
// VITÓRIA
// ============================================================
var WIN = {
  timer:     0,
  alpha:     0,
};

function updateWin(){
  WIN.timer++;
  if(WIN.alpha < 1) WIN.alpha = Math.min(1, WIN.alpha + 0.015);
}

function drawWin(ctx, W, H){
  var bg = IMGS['screen_win'];
  if(bg){
    var scale = Math.max(W/bg.width, H/bg.height);
    var dw = Math.round(bg.width  * scale);
    var dh = Math.round(bg.height * scale);
    ctx.globalAlpha = WIN.alpha;
    ctx.drawImage(bg, Math.round((W-dw)/2), Math.round((H-dh)/2), dw, dh);
    ctx.globalAlpha = 1;
  } else {
    ctx.fillStyle = '#000a05';
    ctx.fillRect(0, 0, W, H);
  }

  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = 'center';

  // MISSÃO CUMPRIDA
  ctx.fillStyle = 'rgba(0,0,0,0.8)';
  ctx.font = 'bold 30px "Courier New", monospace';
  ctx.fillText('MISSÃO CUMPRIDA!', W/2 + 2, H/2 - 48);

  ctx.fillStyle = '#00FF88';
  ctx.font = 'bold 30px "Courier New", monospace';
  ctx.fillText('MISSÃO CUMPRIDA!', W/2, H/2 - 50);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '13px "Courier New", monospace';
  ctx.fillText('Gabriel destruiu os servidores da NEXCORP!', W/2, H/2 - 20);
  ctx.fillText('O Brasil está salvo!  🇧🇷', W/2, H/2 + 2);

  // Score
  ctx.fillStyle = '#FFD700';
  ctx.font = 'bold 16px "Courier New", monospace';
  ctx.fillText('SCORE FINAL: ' + P.score.toString().padStart(8,'0'), W/2, H/2 + 32);

  // Continuar
  if(WIN.timer > 120 && Math.floor(Date.now()/500)%2===0){
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 12px "Courier New", monospace';
    ctx.fillText('▶  PRESSIONE ENTER OU TOQUE PARA VOLTAR AO INÍCIO  ◀', W/2, H - 30);
  }

  ctx.textAlign = 'left';
}

// ============================================================
// REINICIA O JOGO
// ============================================================
function initGame(){
  // Reseta player
  P.x        = 150;
  P.y        = GROUND_Y - P.h;
  P.vx       = 0;
  P.vy       = 0;
  P.lives    = 15;
  P.score    = 0;
  P.dead     = false;
  P.inv      = 0;
  P.jCount   = 0;
  P.onGround = false;
  camX       = 0;

  // Reseta inimigos e balas
  BULLETS       = [];
  ENEMY_BULLETS = [];
  spawnEnemies();

  // Reseta HUD
  HUD.lastScore    = 0;
  HUD.scoreFlash   = 0;
  HUD.zoneMsg      = '';
  HUD.zoneMsgTimer = 0;
  HUD.lastZone     = 0;

  // Reseta telas
  INTRO.currentLine = 0;
  INTRO.currentChar = 0;
  INTRO.charTimer   = 0;
  INTRO.lineTimer   = 0;
  INTRO.done        = false;
  TITLE.alpha       = 0;
  GAMEOVER.timer    = 0;
  GAMEOVER.showRetry = false;
  WIN.timer         = 0;
  WIN.alpha         = 0;

  GAME_STATE = 'intro';
}

// ============================================================
// INPUT DAS TELAS — teclado e toque
// ============================================================
window.addEventListener('keydown', function(e){
  if(e.code === 'Enter' || e.code === 'Space'){
    handleScreenInput();
  }
});

document.addEventListener('touchstart', function(e){
  // Só dispara se não tocou num botão de controle
  var el = document.elementFromPoint(
    e.changedTouches[0].clientX,
    e.changedTouches[0].clientY
  );
  if(el && el.getAttribute('data-btn')) return;
  handleScreenInput();
}, { passive: true });

function handleScreenInput(){
  if(GAME_STATE === 'intro'){
    if(!INTRO.done){
      // Pula a intro — mostra tudo de uma vez
      INTRO.currentLine = INTRO.lines.length - 1;
      INTRO.currentChar = INTRO.lines[INTRO.currentLine].length;
      INTRO.done        = true;
    } else {
      TITLE.alpha  = 0;
      GAME_STATE   = 'title';
    }
  } else if(GAME_STATE === 'title'){
    GAME_STATE = 'playing';
  } else if(GAME_STATE === 'gameover'){
    if(GAMEOVER.showRetry) initGame();
  } else if(GAME_STATE === 'win'){
    if(WIN.timer > 120) initGame();
  }
}

// ============================================================
// DESENHA TELA ATUAL
// ============================================================
function drawScreen(ctx, W, H){
  if(GAME_STATE === 'intro'){
    updateIntro();
    drawIntro(ctx, W, H);
    // Avança automaticamente após terminar
    if(INTRO.done){
      INTRO.lineTimer++;
      if(INTRO.lineTimer > 90){
        TITLE.alpha = 0;
        GAME_STATE  = 'title';
      }
    }
  } else if(GAME_STATE === 'title'){
    updateTitle();
    drawTitle(ctx, W, H);
  } else if(GAME_STATE === 'gameover'){
    updateGameOver();
    drawGameOver(ctx, W, H);
  } else if(GAME_STATE === 'win'){
    updateWin();
    drawWin(ctx, W, H);
  }
}
