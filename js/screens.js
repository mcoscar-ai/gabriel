// ============================================================
// screens.js — Telas do jogo: intro, título, game over, vitória
// ============================================================

var GAME_STATE = 'intro';

// ============================================================
// INTRO — Gabriel no quarto
// ============================================================
var INTRO = {
  lines: [
    '> SISTEMA HACKEADO...',
    '',
    '> LOCALIZAÇÃO: Penha, Santa Catarina',
    '> DATA: Sábado, 23:30',
    '',
    'Gabriel,',
    'Enquanto todos dormiam...',
    'ele encontrou algo que não devia ver.',
    '',
    'Arquivos encriptados em servidores do governo americano.',
    'Eles planejavam a: OPERAÇÃO NEXCORP.',
    '',
    '> OBJETIVO: Transformar o Beto Carrero World',
    '> em laboratório secreto de Inteligência Artificial',
    '> para destruir os servidores do Brasil',
    '> e iniciar a 3ª Guerra Mundial.',
    '',
    'Gabriel ligou para a polícia...',
    'Ninguém acreditou.',
    '',
    'Ligou para o governo...',
    'Ninguém acreditou.',
    '',
    'Agora ele está sozinho.',
    'E o tempo está acabando.',
    '',
    '[ MISSÃO: DESTRUIR OS SERVIDORES DA NEXCORP ]',
  ],
  currentLine: 0,
  currentChar: 0,
  charTimer:   0,
  lineTimer:   0,
  done:        false,
  doneTimer:   0,  // delay após terminar antes de aceitar toque
};

function updateIntro(){
  if(INTRO.done) return;

  INTRO.charTimer++;

  // 1 letra a cada 2 frames = mais rápido
  if(INTRO.charTimer >= 2){
    INTRO.charTimer = 0;
    var line = INTRO.lines[INTRO.currentLine];

    if(INTRO.currentChar < line.length){
      INTRO.currentChar++;
    } else {
      var pause = (line === '') ? 25 : (line.indexOf('[') !== -1) ? 80 : 40;
      INTRO.lineTimer++;
      if(INTRO.lineTimer >= pause){
        INTRO.lineTimer   = 0;
        INTRO.currentLine++;
        INTRO.currentChar = 0;
        if(INTRO.currentLine >= INTRO.lines.length){
          INTRO.done = true;
          INTRO.doneTimer = 0;
        }
      }
    }
  }
}

function drawIntro(ctx, W, H){
  // Fundo preto
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  // Alta qualidade de imagem
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // LADO DIREITO — imagem do Gabriel completa
  var bg = IMGS['screen_room'];
  if(bg){
    var imgW  = Math.round(W * 0.45);
    var scale = Math.min(imgW / bg.width, H / bg.height);
    var dw    = Math.round(bg.width  * scale);
    var dh    = Math.round(bg.height * scale);
    var dx    = Math.round(W - dw - 10);
    var dy    = Math.round((H - dh) / 2);
    ctx.drawImage(bg, dx, dy, dw, dh);

    // Gradiente esquerda da imagem para fundir
    var grad = ctx.createLinearGradient(dx - 40, 0, dx + 80, 0);
    grad.addColorStop(0, 'rgba(0,0,0,1)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(dx - 40, 0, 120, H);
  }

  // LADO ESQUERDO — fundo claro atrás do texto
  var textX  = 16;
  var textW  = Math.round(W * 0.50);
  var lineH  = 24;
  var startY = 28;
  var maxLines = 13;

  // Fundo branco semitransparente atrás do texto
  ctx.fillStyle = 'rgba(255,255,255,0.88)';
  ctx.fillRect(0, 0, textW + 20, H);

  // Borda direita suave
  var gradText = ctx.createLinearGradient(textW, 0, textW + 40, 0);
  gradText.addColorStop(0, 'rgba(255,255,255,0.88)');
  gradText.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradText;
  ctx.fillRect(textW, 0, 40, H);

  // Header
  ctx.fillStyle = '#007744';
  ctx.font      = 'bold 11px "Courier New", monospace';
  ctx.fillText('> GABRIEL_SHADOW_CIRCUIT.log', textX, startY);
  ctx.fillStyle = 'rgba(0,180,80,0.4)';
  ctx.fillRect(textX, startY + 4, textW, 1);

  // Só mostra linhas que já foram digitadas (idx <= currentLine)
  ctx.font = '17px "Courier New", monospace';
  var visibleCount = 0;
  var renderStart  = Math.max(0, INTRO.currentLine - maxLines + 1);

  for(var idx = renderStart; idx <= INTRO.currentLine && visibleCount < maxLines; idx++){
    if(idx >= INTRO.lines.length) break;

    var text = INTRO.lines[idx];

    // Linha atual — mostra só até currentChar
    if(idx === INTRO.currentLine){
      text = text.substring(0, INTRO.currentChar);
    }

    if(text === ''){ visibleCount++; continue; }

    // Cor por tipo
    if(text.indexOf('[') !== -1){
      ctx.fillStyle = '#CC6600';
      ctx.font      = 'bold 17px "Courier New", monospace';
    } else if(text.indexOf('NEXCORP') !== -1 || text.indexOf('Guerra') !== -1 || text.indexOf('OPERAÇÃO') !== -1){
      ctx.fillStyle = '#CC0000';
      ctx.font      = 'bold 17px "Courier New", monospace';
    } else if(text.indexOf('>') === 0){
      ctx.fillStyle = '#007744';
      ctx.font      = '17px "Courier New", monospace';
    } else {
      ctx.fillStyle = '#111111';
      ctx.font      = '17px "Courier New", monospace';
    }

    var y = startY + 20 + visibleCount * lineH;

    // Quebra linha se largo demais
    if(ctx.measureText(text).width > textW - 10){
      var words = text.split(' ');
      var line1 = '';
      for(var w = 0; w < words.length; w++){
        var test = line1 + words[w] + ' ';
        if(ctx.measureText(test).width > textW - 10){
          ctx.fillText(line1.trim(), textX, y);
          visibleCount++;
          y = startY + 20 + visibleCount * lineH;
          line1 = words[w] + ' ';
        } else {
          line1 = test;
        }
      }
      if(line1.trim()) ctx.fillText(line1.trim(), textX, y);
    } else {
      ctx.fillText(text, textX, y);
    }

    // Cursor piscando na linha atual
    if(idx === INTRO.currentLine && Math.floor(Date.now()/400)%2===0){
      var tw = ctx.measureText(text).width;
      ctx.fillStyle = '#007744';
      ctx.fillRect(textX + tw + 2, y - 13, 8, 15);
    }

    visibleCount++;
  }

  // Instrução — só mostra TOQUE para continuar quando texto termina
  if(INTRO.done && Math.floor(Date.now()/600)%2===0){
    ctx.fillStyle = '#007744';
    ctx.font      = 'bold 12px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('▶  TOQUE OU ENTER PARA CONTINUAR  ◀', W * 0.26, H - 8);
    ctx.textAlign = 'left';
  } else if(!INTRO.done){
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.font      = '10px "Courier New", monospace';
    ctx.textAlign = 'right';
    ctx.fillText('ENTER para pular', W - 10, H - 5);
    ctx.textAlign = 'left';
  }
}

// ============================================================
// TÍTULO
// ============================================================
var TITLE = {
  alpha:       0,
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
    var dw    = Math.round(bg.width  * scale);
    var dh    = Math.round(bg.height * scale);
    ctx.globalAlpha = TITLE.alpha;
    ctx.drawImage(bg, Math.round((W-dw)/2), Math.round((H-dh)/2), dw, dh);
    ctx.globalAlpha = 1;
  } else {
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, W, H);
  }

  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = 'center';

  // Título com glitch
  var glitch = (TITLE.glitchTimer % 180 < 4);
  ctx.fillStyle = 'rgba(0,0,0,0.8)';
  ctx.font = 'bold 32px "Courier New", monospace';
  ctx.fillText('GABRIEL', W/2 + 2, 62);

  ctx.fillStyle = glitch ? '#FF0044' : '#00FF88';
  ctx.font = 'bold 32px "Courier New", monospace';
  ctx.fillText('GABRIEL', W/2 + (glitch?2:0), 60);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 14px "Courier New", monospace';
  ctx.fillText('SHADOW CIRCUIT', W/2, 82);

  // Pressione para começar
  if(Math.floor(Date.now()/500)%2===0){
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 12px "Courier New", monospace';
    ctx.fillText('▶  PRESSIONE ENTER OU TOQUE PARA COMEÇAR  ◀', W/2, H - 30);
  }

  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.font = '9px "Courier New", monospace';
  ctx.fillText('v1.0 — GABRIEL: SHADOW CIRCUIT', W/2, H - 10);
  ctx.textAlign = 'left';
}

// ============================================================
// GAME OVER
// ============================================================
var GAMEOVER = {
  timer:      0,
  showRetry:  false,
};

function updateGameOver(){
  GAMEOVER.timer++;
  if(GAMEOVER.timer > 150) GAMEOVER.showRetry = true;
}

function drawGameOver(ctx, W, H){
  var bg = IMGS['screen_gameover'];
  if(bg){
    var scale = Math.max(W/bg.width, H/bg.height);
    var dw    = Math.round(bg.width  * scale);
    var dh    = Math.round(bg.height * scale);
    ctx.drawImage(bg, Math.round((W-dw)/2), Math.round((H-dh)/2), dw, dh);
  } else {
    ctx.fillStyle = '#0a0005';
    ctx.fillRect(0, 0, W, H);
  }

  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = 'center';

  ctx.fillStyle = 'rgba(0,0,0,0.8)';
  ctx.font = 'bold 48px "Courier New", monospace';
  ctx.fillText('GAME OVER', W/2 + 3, H/2 - 28);

  ctx.fillStyle = '#FF2222';
  ctx.font = 'bold 48px "Courier New", monospace';
  ctx.fillText('GAME OVER', W/2, H/2 - 30);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 14px "Courier New", monospace';
  ctx.fillText('SCORE FINAL: ' + P.score.toString().padStart(8,'0'), W/2, H/2 + 10);

  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = '11px "Courier New", monospace';
  ctx.fillText('A NEXCORP venceu... por enquanto.', W/2, H/2 + 32);

  if(GAMEOVER.showRetry && Math.floor(Date.now()/500)%2===0){
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 12px "Courier New", monospace';
    ctx.fillText('▶  ENTER OU TOQUE PARA TENTAR NOVAMENTE  ◀', W/2, H - 30);
  }
  ctx.textAlign = 'left';
}

// ============================================================
// VITÓRIA
// ============================================================
var WIN = {
  timer: 0,
  alpha: 0,
};

function updateWin(){
  WIN.timer++;
  if(WIN.alpha < 1) WIN.alpha = Math.min(1, WIN.alpha + 0.015);
}

function drawWin(ctx, W, H){
  var bg = IMGS['screen_win'];
  if(bg){
    var scale = Math.max(W/bg.width, H/bg.height);
    var dw    = Math.round(bg.width  * scale);
    var dh    = Math.round(bg.height * scale);
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

  ctx.fillStyle = 'rgba(0,0,0,0.8)';
  ctx.font = 'bold 30px "Courier New", monospace';
  ctx.fillText('MISSÃO CUMPRIDA!', W/2 + 2, H/2 - 48);

  ctx.fillStyle = '#00FF88';
  ctx.font = 'bold 30px "Courier New", monospace';
  ctx.fillText('MISSÃO CUMPRIDA!', W/2, H/2 - 50);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '13px "Courier New", monospace';
  ctx.fillText('Gabriel destruiu os servidores da NEXCORP!', W/2, H/2 - 20);
  ctx.fillText('O Brasil está salvo! 🇧🇷', W/2, H/2 + 2);

  ctx.fillStyle = '#FFD700';
  ctx.font = 'bold 16px "Courier New", monospace';
  ctx.fillText('SCORE FINAL: ' + P.score.toString().padStart(8,'0'), W/2, H/2 + 32);

  if(WIN.timer > 120 && Math.floor(Date.now()/500)%2===0){
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 12px "Courier New", monospace';
    ctx.fillText('▶  ENTER OU TOQUE PARA VOLTAR AO INÍCIO  ◀', W/2, H - 30);
  }
  ctx.textAlign = 'left';
}

// ============================================================
// REINICIA O JOGO
// ============================================================
function initGame(){
  P.x = 150; P.y = GROUND_Y - P.h;
  P.vx = 0; P.vy = 0;
  P.lives = 15; P.score = 0;
  P.dead = false; P.inv = 0;
  P.jCount = 0; P.onGround = false;
  camX = 0;
  BULLETS = []; ENEMY_BULLETS = [];
  spawnEnemies();
  HUD.lastScore = 0; HUD.scoreFlash = 0;
  HUD.zoneMsg = ''; HUD.zoneMsgTimer = 0; HUD.lastZone = 0;
  INTRO.currentLine = 0; INTRO.currentChar = 0;
  INTRO.charTimer = 0; INTRO.lineTimer = 0; INTRO.done = false; INTRO.doneTimer = 0;
  TITLE.alpha = 0; TITLE.glitchTimer = 0;
  GAMEOVER.timer = 0; GAMEOVER.showRetry = false;
  WIN.timer = 0; WIN.alpha = 0;
  GAME_STATE = 'intro';
}

// ============================================================
// INPUT DAS TELAS
// ============================================================
window.addEventListener('keydown', function(e){
  if(e.code === 'Enter' || e.code === 'Space') handleScreenInput(false);
});

document.addEventListener('touchstart', function(e){
  var el = document.elementFromPoint(
    e.changedTouches[0].clientX,
    e.changedTouches[0].clientY
  );
  if(el && el.getAttribute('data-btn')) return;
  handleScreenInput(true);
}, { passive: true });

function handleScreenInput(isTouch){
  if(GAME_STATE === 'intro'){
    if(!INTRO.done){
      if(!isTouch){
        INTRO.currentLine = INTRO.lines.length - 1;
        INTRO.currentChar = INTRO.lines[INTRO.currentLine].length;
        INTRO.done = true;
        INTRO.doneTimer = 0;
      }
    } else if(INTRO.doneTimer > 60){ // aguarda 1 segundo antes de aceitar toque
      TITLE.alpha = 0;
      GAME_STATE = 'title';
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
    if(INTRO.done){
      INTRO.doneTimer++;
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
