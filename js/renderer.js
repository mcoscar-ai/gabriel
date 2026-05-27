// ============================================================
// renderer.js — Gabriel: Shadow Circuit
// Responsável por: background parallax, chão, plataformas
// Depende de globais: camX, W, H, GROUND_Y, BG_W, GW, PLATFORMS, ASSETS
// ============================================================

// ------------------------------------------------------------
// getZone()
// Retorna a zona atual (1, 2 ou 3) baseado em camX
// Zona 1: x 0–1333  | Zona 2: x 1333–2666 | Zona 3: x 2666+
// ------------------------------------------------------------
function getZone() {
  if (camX < 1333) return 1;
  if (camX < 2666) return 2;
  return 3;
}

// ------------------------------------------------------------
// drawBackground(ctx)
// Parallax: bg move mais devagar que o mundo
// scrollFactor = BG_W / GW = 1920/4000 = 0.48
// Isso garante que o bg termina exatamente quando o mundo termina
// Técnica: modulo wrapping + desenho duplo para cobrir emenda
// ------------------------------------------------------------
function drawBackground(ctx) {
  var zone = getZone();

  // Seleciona imagem do bg conforme zona
  var bgKey;
  if (zone === 1) bgKey = 'bg1';
  else if (zone === 2) bgKey = 'bg2';
  else bgKey = 'bg3';

  var img = IMGS[bgKey];

  // Fallback: fundo sólido se imagem não carregou
  if (!img || !img.complete || img.naturalWidth === 0) {
    var colors = { 1: '#0a1a2e', 2: '#0d1f1a', 3: '#1a0d1f' };
    ctx.fillStyle = colors[zone] || '#0a1a2e';
    ctx.fillRect(0, 0, W, H);
    return;
  }

  // scrollFactor: bg termina junto com o mundo
  var scrollFactor = BG_W / GW; // 0.48

  // Offset do bg no espaço de mundo
  var offsetX = camX * scrollFactor;

  // Modulo wrapping para tiling contínuo
  var imgW = img.naturalWidth || BG_W;
  var wrappedX = ((offsetX % imgW) + imgW) % imgW;

  // Escala do bg para cobrir a altura do canvas
  var scale = H / (img.naturalHeight || H);
  var drawW = imgW * scale;
  var drawH = H;

  // Desenha duas vezes para cobrir a emenda (parallax tiling)
  ctx.drawImage(img, -wrappedX * scale, 0, drawW, drawH);
  ctx.drawImage(img, drawW - wrappedX * scale, 0, drawW, drawH);

  // Overlay escuro sutil para profundidade — varia por zona
  var overlayAlpha = { 1: 0.10, 2: 0.18, 3: 0.22 };
  ctx.fillStyle = 'rgba(0,0,0,' + overlayAlpha[zone] + ')';
  ctx.fillRect(0, 0, W, H);
}

// ------------------------------------------------------------
// drawGround(ctx)
// Faixa do chão de GROUND_Y até H
// Visual muda por zona: asfalto, laboratório, datacenter
// ------------------------------------------------------------
function drawGround(ctx) {
  var zone = getZone();

  // Paleta por zona
  var groundColors = {
    1: { fill: '#1a1208', border: '#c8a020', glow: 'rgba(200,160,32,0.25)' },   // Beto Carrero — terra noturna
    2: { fill: '#0d1f14', border: '#00ff88', glow: 'rgba(0,255,136,0.20)' },    // Laboratório — verde neon
    3: { fill: '#0d0d1f', border: '#00aaff', glow: 'rgba(0,170,255,0.22)' }     // Datacenter — azul cibernético
  };

  var c = groundColors[zone];

  // Glow difuso acima do chão
  var glowGrad = ctx.createLinearGradient(0, GROUND_Y - 12, 0, GROUND_Y + 8);
  glowGrad.addColorStop(0, c.glow);
  glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, GROUND_Y - 12, W, 20);

  // Faixa principal do chão
  ctx.fillStyle = c.fill;
  ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);

  // Linha de borda luminosa no topo do chão
  ctx.strokeStyle = c.border;
  ctx.lineWidth = 2;
  ctx.shadowColor = c.border;
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  ctx.lineTo(W, GROUND_Y);
  ctx.stroke();

  // Segunda linha mais fina para reforço visual
  ctx.strokeStyle = c.border;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y + 4);
  ctx.lineTo(W, GROUND_Y + 4);
  ctx.stroke();
  ctx.globalAlpha = 1.0;

  // Reset shadow
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';
}

// ------------------------------------------------------------
// drawPlatforms(ctx)
// Itera PLATFORMS, desenha apenas as visíveis na câmera
// Estilo cyberpunk/neon com gradiente + borda brilhante
// ------------------------------------------------------------
function drawPlatforms(ctx) {
  var zone = getZone();

  // Cor da plataforma por zona
  var platColors = {
    1: { top: '#c8a020', fill1: '#3d2e08', fill2: '#1a1208', shadow: 'rgba(200,160,32,0.5)' },
    2: { top: '#00ff88', fill1: '#083d20', fill2: '#041a10', shadow: 'rgba(0,255,136,0.45)' },
    3: { top: '#00aaff', fill1: '#082040', fill2: '#040d1a', shadow: 'rgba(0,170,255,0.45)' }
  };

  var c = platColors[zone];

  for (var i = 0; i < PLATFORMS.length; i++) {
    var p = PLATFORMS[i];

    // Converte coordenadas de mundo para tela
    var sx = p.x - camX;
    var sy = p.y;

    // Culling: ignora plataformas fora da tela (margem de 20px)
    if (sx + p.w < -20 || sx > W + 20) continue;

    // Gradiente vertical da plataforma
    var grad = ctx.createLinearGradient(sx, sy, sx, sy + p.h);
    grad.addColorStop(0, c.fill1);
    grad.addColorStop(1, c.fill2);
    ctx.fillStyle = grad;
    ctx.fillRect(sx, sy, p.w, p.h);

    // Borda lateral e inferior discreta
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.strokeRect(sx, sy, p.w, p.h);

    // Linha de topo luminosa (principal — onde o player pisa)
    ctx.shadowColor = c.shadow;
    ctx.shadowBlur = 8;
    ctx.strokeStyle = c.top;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sx, sy + 1);
    ctx.lineTo(sx + p.w, sy + 1);
    ctx.stroke();

    // Reflexo interno sutil (linha branca fina abaixo do topo)
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sx + 2, sy + 4);
    ctx.lineTo(sx + p.w - 2, sy + 4);
    ctx.stroke();
  }

  // Reset shadow
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';
}

// ------------------------------------------------------------
// drawScene(ctx)
// Função principal — chama tudo na ordem correta
// Chamada pelo game loop a cada frame ANTES de desenhar
// player, inimigos e HUD
// ------------------------------------------------------------
function drawScene(ctx) {
  drawBackground(ctx);
  drawGround(ctx);
  drawPlatforms(ctx);
}
