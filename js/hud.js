// ============================================================
// hud.js — Interface do jogo: vidas, score, zona, progresso
// Requer: assets.js, player.js, renderer.js
// ============================================================

var HUD = {
  // Score com flash ao aumentar
  lastScore:    0,
  scoreFlash:   0,

  // Aviso de zona nova
  zoneMsg:      '',
  zoneMsgTimer: 0,
  lastZone:     0,
};

// ============================================================
// FUNÇÃO PRINCIPAL — chama tudo
// ============================================================
function drawHUD(ctx, W, H){
  // Detecta troca de zona
  var currentZone = getZone();
  if(currentZone !== HUD.lastZone && HUD.lastZone !== 0){
    HUD.zoneMsg      = getZoneName();
    HUD.zoneMsgTimer = 180; // 3 segundos
  }
  HUD.lastZone = currentZone;

  // Detecta aumento de score
  if(P.score > HUD.lastScore){
    HUD.scoreFlash = 30;
    HUD.lastScore  = P.score;
  }

  drawHUDBar(ctx, W);
  drawLives(ctx, W, H);
  drawScore(ctx, W);
  drawZoneName(ctx, W);
  drawProgressBar(ctx, W, H);
  drawZoneMessage(ctx, W, H);
}

// ============================================================
// BARRA SUPERIOR
// ============================================================
function drawHUDBar(ctx, W){
  // Fundo semitransparente
  ctx.fillStyle = 'rgba(0,0,0,0.65)';
  ctx.fillRect(0, 0, W, 28);

  // Linha neon embaixo da barra
  var z = getZone();
  var c = z===1 ? '#00FF88' : z===2 ? '#00C8FF' : '#FF5050';
  ctx.fillStyle = c;
  ctx.fillRect(0, 27, W, 1);
  ctx.fillStyle = c.replace(')', ',0.2)').replace('rgb', 'rgba');
  ctx.fillRect(0, 28, W, 3);
}

// ============================================================
// ÍCONES DE VIDA
// ============================================================
function drawLives(ctx, W, H){
  var img      = IMGS['life'];
  var iconSize = 18;
  var startX   = 8;
  var startY   = 5;
  var perRow   = 8;
  var gap      = 2;

  for(var i = 0; i < P.lives; i++){
    var col = i % perRow;
    var row = Math.floor(i / perRow);
    var ix  = startX + col * (iconSize + gap);
    var iy  = startY + row * (iconSize + gap);

    if(img){
      ctx.drawImage(img, ix, iy, iconSize, iconSize);
    } else {
      // Fallback — coração vermelho
      ctx.fillStyle = '#ff3355';
      ctx.font = '14px monospace';
      ctx.fillText('♥', ix, iy + 13);
    }
  }
}

// ============================================================
// SCORE
// ============================================================
function drawScore(ctx, W){
  if(HUD.scoreFlash > 0) HUD.scoreFlash--;

  var flash = HUD.scoreFlash > 0;
  ctx.textAlign = 'right';

  // Sombra
  ctx.fillStyle = 'rgba(0,0,0,0.8)';
  ctx.font = 'bold 13px "Courier New", monospace';
  ctx.fillText(P.score.toString().padStart(8,'0'), W - 7, 18);

  // Texto principal
  ctx.fillStyle = flash ? '#FFD700' : '#FFFFFF';
  ctx.font = 'bold 13px "Courier New", monospace';
  ctx.fillText(P.score.toString().padStart(8,'0'), W - 8, 17);

  // Label
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.font = '9px "Courier New", monospace';
  ctx.fillText('SCORE', W - 8, 8);

  ctx.textAlign = 'left';
}

// ============================================================
// NOME DA ZONA
// ============================================================
function drawZoneName(ctx, W){
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = '10px "Courier New", monospace';
  ctx.fillText(getZoneName(), W/2, 17);
  ctx.textAlign = 'left';
}

// ============================================================
// BARRA DE PROGRESSO — embaixo da tela
// ============================================================
function drawProgressBar(ctx, W, H){
  var barH   = 4;
  var barY   = H - barH;
  var pct    = Math.min(1, (P.x / (GW - P.w)));

  // Fundo
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(0, barY, W, barH);

  // Progresso
  var z = getZone();
  var c = z===1 ? '#00FF88' : z===2 ? '#00C8FF' : '#FF5050';
  ctx.fillStyle = c;
  ctx.fillRect(0, barY, Math.round(W * pct), barH);

  // Ícone do Gabriel na barra
  ctx.fillStyle = '#fff';
  ctx.fillRect(Math.round(W * pct) - 2, barY - 2, 4, barH + 2);

  // Marcadores de zona
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.fillRect(Math.round(W * 0.33) - 1, barY, 2, barH);
  ctx.fillRect(Math.round(W * 0.66) - 1, barY, 2, barH);
}

// ============================================================
// AVISO DE ZONA NOVA
// ============================================================
function drawZoneMessage(ctx, W, H){
  if(HUD.zoneMsgTimer <= 0) return;
  HUD.zoneMsgTimer--;

  var alpha = 1;
  // Fade out nos últimos 60 frames
  if(HUD.zoneMsgTimer < 60){
    alpha = HUD.zoneMsgTimer / 60;
  }
  // Fade in nos primeiros 20 frames
  if(HUD.zoneMsgTimer > 160){
    alpha = (180 - HUD.zoneMsgTimer) / 20;
  }

  ctx.save();
  ctx.globalAlpha = alpha;

  // Fundo escuro centralizado
  var bw = 400, bh = 60;
  var bx = (W - bw) / 2;
  var by = H / 2 - bh / 2 - 20;

  ctx.fillStyle = 'rgba(0,0,0,0.75)';
  ctx.fillRect(bx, by, bw, bh);

  // Borda neon
  var z = getZone();
  var c = z===1 ? '#00FF88' : z===2 ? '#00C8FF' : '#FF5050';
  ctx.strokeStyle = c;
  ctx.lineWidth   = 2;
  ctx.strokeRect(bx, by, bw, bh);

  // Texto
  ctx.fillStyle   = c;
  ctx.font        = 'bold 11px "Courier New", monospace';
  ctx.textAlign   = 'center';
  ctx.fillText('⚠ ÁREA RESTRITA', W/2, by + 18);

  ctx.fillStyle   = '#ffffff';
  ctx.font        = 'bold 16px "Courier New", monospace';
  ctx.fillText(HUD.zoneMsg, W/2, by + 42);

  ctx.textAlign = 'left';
  ctx.restore();
}
