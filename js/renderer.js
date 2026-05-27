// ============================================================
// renderer.js — Desenha backgrounds, chão e plataformas
// Requer: assets.js, player.js (camX, GROUND_Y, PLATFORMS)
// ============================================================

var BG_W = 1774;

function getZone(){
  if(camX < GW * 0.33) return 1;
  if(camX < GW * 0.66) return 2;
  return 3;
}

function getZoneName(){
  var z = getZone();
  if(z === 1) return 'ZONA 1 — Beto Carrero';
  if(z === 2) return 'ZONA 2 — Laboratório';
  return 'ZONA 3 — Datacenter NEXCORP';
}

function getZoneBg(){
  var z = getZone();
  if(z === 1) return IMGS['bg1'];
  if(z === 2) return IMGS['bg2'];
  return IMGS['bg3'];
}

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

  var scale = H / bg.height;
  var drawW = Math.round(bg.width * scale);
  var speed = 0.4;
  var offset = -(camX * speed) % drawW;
  if(offset > 0) offset -= drawW;

  var x = Math.round(offset);
  while(x < W){
    ctx.drawImage(bg, x, 0, drawW, H);
    x += drawW;
  }

  ctx.fillStyle = 'rgba(0,0,10,0.25)';
  ctx.fillRect(0, 0, W, H);
}

var _lastZone = 1;
var _zoneFade = 0;

function drawZoneTransition(ctx, W, H){
  var currentZone = getZone();
  if(currentZone !== _lastZone){
    _lastZone = currentZone;
    _zoneFade = 30;
  }
  if(_zoneFade > 0){
    ctx.fillStyle = 'rgba(0,0,0,' + (_zoneFade / 30 * 0.6) + ')';
    ctx.fillRect(0, 0, W, H);
    _zoneFade--;
  }
}

function drawGround(ctx, W, H){
  ctx.fillStyle = '#0d0d14';
  ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);

  var z = getZone();
  var lineColor = z===1 ? 'rgba(0,255,136,0.8)' : z===2 ? 'rgba(0,200,255,0.8)' : 'rgba(255,80,80,0.8)';

  ctx.fillStyle = lineColor;
  ctx.fillRect(0, GROUND_Y, W, 2);
  ctx.fillStyle = lineColor.replace('0.8','0.15');
  ctx.fillRect(0, GROUND_Y+2, W, 6);

  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  ctx.lineWidth = 1;
  for(var y = GROUND_Y+16; y < H; y+=18){
    ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke();
  }
  var vStep = 55;
  var vOff = -(camX % vStep);
  for(var x = vOff; x < W+vStep; x+=vStep){
    ctx.beginPath(); ctx.moveTo(Math.round(x),GROUND_Y+2); ctx.lineTo(Math.round(x),H); ctx.stroke();
  }
}

function drawPlatforms(ctx){
  var z = getZone();
  var neonColor = z===1 ? 'rgba(0,255,136,' : z===2 ? 'rgba(0,200,255,' : 'rgba(255,80,80,';

  PLATFORMS.forEach(function(pl){
    var sx = Math.round(pl.x - camX);
    if(sx+pl.w < -10 || sx > 810) return;

    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(sx+4, pl.y+6, pl.w, pl.h);
    ctx.fillStyle = '#1a1a28';
    ctx.fillRect(sx, pl.y, pl.w, pl.h);
    ctx.fillStyle = '#262636';
    ctx.fillRect(sx, pl.y, pl.w, 5);
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(sx, pl.y+pl.h-3, pl.w, 3);
    ctx.fillStyle = neonColor+'0.7)';
    ctx.fillRect(sx, pl.y+pl.h-2, pl.w, 2);
    ctx.fillStyle = neonColor+'0.12)';
    ctx.fillRect(sx, pl.y+pl.h, pl.w, 4);

    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 1;
    for(var bx = sx+44; bx < sx+pl.w; bx+=44){
      ctx.beginPath(); ctx.moveTo(bx,pl.y); ctx.lineTo(bx,pl.y+pl.h); ctx.stroke();
    }
    ctx.fillStyle = neonColor+'0.15)';
    ctx.fillRect(sx+3, pl.y+3, 6, pl.h-6);
  });
}

function renderScene(ctx, W, H){
  drawBg(ctx, W, H);
  drawZoneTransition(ctx, W, H);
  drawGround(ctx, W, H);
  drawPlatforms(ctx);
}
