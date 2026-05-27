// ============================================================
// renderer.js — Desenha backgrounds, chão e plataformas
// Técnica: parallax com 2x drawImage para scroll infinito
// Requer: assets.js, player.js (camX, GROUND_Y, PLATFORMS)
// ============================================================

var BG_W = 1774; // largura real dos backgrounds

// Retorna zona atual: 1, 2 ou 3
function getZone(){
  if(camX < GW * 0.33) return 1;
  if(camX < GW * 0.66) return 2;
  return 3;
}

// Retorna nome da zona atual
function getZoneName(){
  var z = getZone();
  if(z === 1) return 'ZONA 1 — Beto Carrero';
  if(z === 2) return 'ZONA 2 — Laboratório';
  return 'ZONA 3 — Datacenter NEXCORP';
}

// Retorna imagem de background da zona atual
function getZoneBg(){
  var z = getZone();
  if(z === 1) return IMGS['bg1'];
  if(z === 2) return IMGS['bg2'];
  return IMGS['bg3'];
}

// ============================================================
// BACKGROUND COM PARALLAX
// Técnica: offset = -(camX * speed % BG_W)
// Desenha 2x a imagem para cobrir toda a tela sem gaps
// ============================================================
function drawBg(ctx, W, H){
  var bg = getZoneBg();

  if(!bg){
    var z = getZone();
    ctx.fillStyle = z===1 ? '#0a0a1a' : z===2 ? '#0a1a0a' : '#1a0a0a';
    ctx.fillRect(0, 0, W, H);
    return;
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Escala a imagem para altura do canvas mantendo proporção
  var scale  = H / bg.height;
  var drawW  = Math.round(bg.width * scale);

  // Parallax: 40% da velocidade da câmera
  // Módulo garante loop perfeito sem gap
  var speed  = 0.4;
  var offset = -(camX * speed) % drawW;
  if(offset > 0) offset -= drawW;

  // Desenha cópias suficientes para cobrir toda a tela
  var x = Math.round(offset);
  while(x < W){
    ctx.drawImage(bg, x, 0, drawW, H);
    x += drawW;
  }

  // Overlay para atmosfera
  ctx.fillStyle = 'rgba(0,0,10,0.25)';
  ctx.fillRect(0, 0, W, H);
}

  // Overlay escuro para dar atmosfera noturna
  ctx.fillStyle = 'rgba(0, 0, 10, 0.3)';
  ctx.fillRect(0, 0, W, H);
}

// ============================================================
// TRANSIÇÃO DE ZONA — fade suave ao mudar de background
// ============================================================
var _lastZone   = 1;
var _zoneFade   = 0;  // 0 = sem fade, >0 = fadando

function drawZoneTransition(ctx, W, H){
  var currentZone = getZone();
  if(currentZone !== _lastZone){
    _lastZone = currentZone;
    _zoneFade = 30; // 30 frames de fade
  }
  if(_zoneFade > 0){
    ctx.fillStyle = 'rgba(0,0,0,' + (_zoneFade / 30 * 0.6) + ')';
    ctx.fillRect(0, 0, W, H);
    _zoneFade--;
  }
}

// ============================================================
// CHÃO
// ============================================================
function drawGround(ctx, W, H){
  // Base do chão
  ctx.fillStyle = '#0d0d14';
  ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);

  // Linha neon no topo do chão — cor muda por zona
  var z = getZone();
  var lineColor = z === 1 ? 'rgba(0,255,136,0.8)'
                : z === 2 ? 'rgba(0,200,255,0.8)'
                : 'rgba(255,80,80,0.8)';

  ctx.fillStyle = lineColor;
  ctx.fillRect(0, GROUND_Y, W, 2);

  // Glow sob a linha
  ctx.fillStyle = lineColor.replace('0.8', '0.15');
  ctx.fillRect(0, GROUND_Y + 2, W, 6);

  // Grade sutil no chão — dá sensação de movimento
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  ctx.lineWidth = 1;

  // Linhas horizontais
  for(var y = GROUND_Y + 16; y < H; y += 18){
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // Linhas verticais — se movem com a câmera
  var vStep = 55;
  var vOff  = -(camX % vStep);
  for(var x = vOff; x < W + vStep; x += vStep){
    ctx.beginPath();
    ctx.moveTo(Math.round(x), GROUND_Y + 2);
    ctx.lineTo(Math.round(x), H);
    ctx.stroke();
  }
}

// ============================================================
// PLATAFORMAS — estilo cyberpunk/neon
// ============================================================
function drawPlatforms(ctx){
  var z = getZone();
  var neonColor = z === 1 ? 'rgba(0,255,136,'
                : z === 2 ? 'rgba(0,200,255,'
                : 'rgba(255,80,80,';

  PLATFORMS.forEach(function(pl){
    var sx = Math.round(pl.x - camX);

    // Culling — não desenha plataformas fora da tela
    if(sx + pl.w < -10 || sx > 810) return;

    // Sombra
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(sx + 4, pl.y + 6, pl.w, pl.h);

    // Corpo da plataforma
    ctx.fillStyle = '#1a1a28';
    ctx.fillRect(sx, pl.y, pl.w, pl.h);

    // Detalhe superior (brilho)
    ctx.fillStyle = '#262636';
    ctx.fillRect(sx, pl.y, pl.w, 5);

    // Borda inferior escura
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(sx, pl.y + pl.h - 3, pl.w, 3);

    // Linha neon embaixo
    ctx.fillStyle = neonColor + '0.7)';
    ctx.fillRect(sx, pl.y + pl.h - 2, pl.w, 2);

    // Glow neon
    ctx.fillStyle = neonColor + '0.12)';
    ctx.fillRect(sx, pl.y + pl.h, pl.w, 4);

    // Divisórias verticais estilo painel metálico
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 1;
    for(var bx = sx + 44; bx < sx + pl.w; bx += 44){
      ctx.beginPath();
      ctx.moveTo(bx, pl.y);
      ctx.lineTo(bx, pl.y + pl.h);
      ctx.stroke();
    }

    // Detalhe de luz no canto esquerdo
    ctx.fillStyle = neonColor + '0.15)';
    ctx.fillRect(sx + 3, pl.y + 3, 6, pl.h - 6);
  });
}

// ============================================================
// FUNÇÃO PRINCIPAL — chama tudo na ordem certa
// Usada pelo game.js no loop principal
// ============================================================
function renderScene(ctx, W, H){
  drawBg(ctx, W, H);
  drawZoneTransition(ctx, W, H);
  drawGround(ctx, W, H);
  drawPlatforms(ctx);
}
