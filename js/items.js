// ============================================================
// items.js — Itens coletáveis: corações (+3 vidas)
// ============================================================

var ITEMS = [];

var ITEM_SPAWNS = [
  // ZONA 1 (0-32000) — 2 corações
  { x: 8000,  y: GROUND_Y - 40 },
  { x: 24000, y: GROUND_Y - 40 },
  // ZONA 2 (32000-64000) — 2 corações
  { x: 40000, y: GROUND_Y - 40 },
  { x: 56000, y: GROUND_Y - 40 },
  // ZONA 3 (64000-96000) — 2 corações
  { x: 72000, y: GROUND_Y - 40 },
  { x: 88000, y: GROUND_Y - 40 },
];

function spawnItems(){
  ITEMS = [];
  for(var i = 0; i < ITEM_SPAWNS.length; i++){
    var sp = ITEM_SPAWNS[i];
    ITEMS.push({
      x:       sp.x,
      y:       sp.y,
      w:       32,
      h:       32,
      collected: false,
      bobTick:   Math.floor(Math.random() * 60),
    });
  }
}

function updateItems(){
  for(var i = 0; i < ITEMS.length; i++){
    var it = ITEMS[i];
    if(it.collected) continue;

    // Animação flutuante
    it.bobTick++;

    // Colisão com Gabriel
    var itY = it.y + Math.sin(it.bobTick * 0.05) * 8;
    if(P.x + P.w > it.x &&
       P.x       < it.x + it.w &&
       P.y + P.h > itY &&
       P.y       < itY + it.h){
      it.collected = true;
      P.lives += 3;
      // Toca sfx se disponível
      if(typeof playSFX === 'function') playSFX('sfx_hit');
    }
  }
}

function drawItems(ctx){
  var img = IMGS['life'];
  for(var i = 0; i < ITEMS.length; i++){
    var it = ITEMS[i];
    if(it.collected) continue;

    var sx  = Math.round(it.x - camX);
    if(sx + it.w < -10 || sx > 810) continue;

    // Efeito flutuante
    var bobY = Math.round(Math.sin(it.bobTick * 0.05) * 8);
    var y    = Math.round(it.y) + bobY;

    // Glow pulsante
    var glow = (Math.sin(it.bobTick * 0.08) + 1) / 2;
    ctx.save();
    ctx.globalAlpha = 0.3 + glow * 0.4;
    ctx.fillStyle   = '#FF4466';
    ctx.beginPath();
    ctx.arc(sx + it.w/2, y + it.h/2, it.w * 0.8, 0, Math.PI*2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Imagem do coração
    if(img){
      ctx.drawImage(img, sx, y, it.w, it.h);
    } else {
      ctx.fillStyle = '#FF4466';
      ctx.font = '24px monospace';
      ctx.fillText('♥', sx, y + 24);
    }

    // Label +3
    ctx.fillStyle = '#FFFFFF';
    ctx.font      = 'bold 10px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('+3', sx + it.w/2, y - 4);
    ctx.textAlign = 'left';

    ctx.restore();
  }
}
