// ============================================================
// player.js — Gabriel: movimento, física, animação, tiro
// Baseado em padrões comprovados de jogos 2D (jobtalle.com)
// Requer: assets.js, input.js
// ============================================================

// Configurações do mundo
var GROUND_Y  = 338;
var GW        = 4000;  // largura total do mundo
var GAB_H     = 80;    // altura do hitbox do Gabriel
var GAB_W     = 40;    // largura do hitbox

// Câmera
var camX = 0;

// Plataformas do nível
var PLATFORMS = [
  {x:650,  y:GROUND_Y-90,  w:160, h:16},
  {x:1000, y:GROUND_Y-140, w:130, h:16},
  {x:1350, y:GROUND_Y-100, w:170, h:16},
  {x:1700, y:GROUND_Y-150, w:140, h:16},
  {x:2050, y:GROUND_Y-110, w:160, h:16},
  {x:2400, y:GROUND_Y-160, w:130, h:16},
  {x:2750, y:GROUND_Y-120, w:170, h:16},
  {x:3100, y:GROUND_Y-150, w:140, h:16},
  {x:3450, y:GROUND_Y-110, w:160, h:16},
  {x:3750, y:GROUND_Y-140, w:130, h:16},
];

// Estado do jogador
var P = {
  x:        150,
  y:        GROUND_Y - GAB_H,
  vx:       0,
  vy:       0,
  w:        GAB_W,
  h:        GAB_H,
  dir:      1,        // 1 = direita, -1 = esquerda
  onGround: false,
  jCount:   0,        // quantos pulos usou (max 2)
  crouching:false,
  lives:    3,
  inv:      0,        // frames de invencibilidade
  score:    0,
  dead:     false,

  // Animação
  animFrame:  0,      // 0=idle 1=run1 2=run2 3=jump 4=crouch
  runTick:    0,
  runToggle:  0,

  // Tiro
  fireCool:   0,      // cooldown entre tiros
};

// Projéteis do jogador
var BULLETS = [];

// ============================================================
// ATUALIZA JOGADOR — chamado todo frame pelo game loop
// ============================================================
function updatePlayer(){
  if(P.dead) return;

  INPUT._updateKeyboard();

  // --- MOVIMENTO HORIZONTAL ---
  var moving = false;
  if(INPUT.left){
    P.vx   = -5;
    P.dir  = -1;
    moving = true;
  } else if(INPUT.right){
    P.vx   = 5;
    P.dir  = 1;
    moving = true;
  } else {
    // Fricção — desacelera suavemente
    P.vx *= 0.75;
    if(Math.abs(P.vx) < 0.1) P.vx = 0;
  }

  // --- AGACHAR (só no chão) ---
  P.crouching = (INPUT.down && P.onGround);
  if(P.crouching){ P.vx = 0; moving = false; }

  // --- PULO DUPLO ---
  if(INPUT.jumpPressed){
    INPUT.clearJump();
    if(P.jCount < 2){
      // Segundo pulo é um pouco mais fraco
      P.vy      = (P.jCount === 0) ? -12 : -9;
      P.jCount++;
      P.onGround = false;
      P.crouching = false;
      // Mantém inércia horizontal — não zera vx!
    }
  }

  // --- GRAVIDADE ---
  if(!P.onGround){
    P.vy += 0.6;
    // Limita velocidade de queda
    if(P.vy > 14) P.vy = 14;
  }

  // --- APLICA MOVIMENTO ---
  P.x += P.vx;
  P.y += P.vy;

  // --- COLISÃO COM LIMITES DO MUNDO ---
  if(P.x < 0)          P.x = 0;
  if(P.x > GW - P.w)   P.x = GW - P.w;

  // Caiu fora da tela — morre
  if(P.y > 600){
    playerHit(true);
    return;
  }

  // --- COLISÃO COM CHÃO ---
  P.onGround = false;
  if(P.vy >= 0 && P.y + P.h >= GROUND_Y){
    P.y        = GROUND_Y - P.h;
    P.vy       = 0;
    P.onGround = true;
    P.jCount   = 0;
  }

  // --- COLISÃO COM PLATAFORMAS (apenas caindo) ---
  if(P.vy >= 0){
    for(var i = 0; i < PLATFORMS.length; i++){
      var pl = PLATFORMS[i];
      var prevBottom = P.y + P.h - P.vy; // posição anterior
      if(P.x + P.w - 4 > pl.x &&
         P.x + 4       < pl.x + pl.w &&
         prevBottom    <= pl.y &&
         P.y + P.h     >= pl.y){
        P.y        = pl.y - P.h;
        P.vy       = 0;
        P.onGround = true;
        P.jCount   = 0;
      }
    }
  }

  // --- CÂMERA SUAVE (lerp) ---
  // Gabriel fica no 1/3 esquerdo da tela
  var targetCam = P.x - 250;
  camX += (targetCam - camX) * 0.1;
  camX  = Math.max(0, Math.min(GW - 800, camX));

  // --- INVENCIBILIDADE ---
  if(P.inv > 0) P.inv--;

  // --- COOLDOWN DE TIRO ---
  if(P.fireCool > 0) P.fireCool--;

  // --- TIRO ---
  if(INPUT.fire && P.fireCool === 0 && !P.crouching){
    fireBullet();
    P.fireCool = 15; // ~0.25s entre tiros a 60fps
  }

  // --- ANIMAÇÃO ---
  // Prioridade: crouch > jump > run > idle
  if(P.crouching && P.onGround){
    P.animFrame = 4; // crouch
  } else if(!P.onGround){
    P.animFrame = 3; // jump
  } else if(moving){
    P.runTick++;
    if(P.runTick >= 8){
      P.runTick   = 0;
      P.runToggle = 1 - P.runToggle;
    }
    P.animFrame = P.runToggle ? 2 : 1; // run1 / run2
  } else {
    P.animFrame = 0; // idle
    P.runTick   = 0;
    P.runToggle = 0;
  }

  // --- ATUALIZA PROJÉTEIS ---
  updateBullets();
}

// ============================================================
// TIRO
// ============================================================
function fireBullet(){
  var bx = P.dir === 1 ? P.x + P.w : P.x - 12;
  BULLETS.push({
    x:  bx,
    y:  P.y + P.h * 0.35, // altura do peito
    vx: P.dir * 9,
    w:  12,
    h:  6,
    active: true,
  });
}

function updateBullets(){
  for(var i = BULLETS.length - 1; i >= 0; i--){
    var b = BULLETS[i];
    if(!b.active){ BULLETS.splice(i, 1); continue; }
    b.x += b.vx;
    // Remove se sair da tela
    if(b.x < camX - 50 || b.x > camX + 850){
      BULLETS.splice(i, 1);
    }
  }
}

// ============================================================
// DANO NO JOGADOR
// ============================================================
function playerHit(instant){
  if(P.inv > 0 && !instant) return; // invencível
  P.lives--;
  if(P.lives <= 0){
    P.lives = 0;
    P.dead  = true;
  } else {
    // Respawn com invencibilidade
    P.inv = 120; // 2 segundos
    if(instant){
      // Caiu no buraco — volta ao início da zona
      P.x  = 150;
      P.y  = GROUND_Y - P.h;
      P.vx = 0;
      P.vy = 0;
    }
  }
}

// ============================================================
// DESENHA GABRIEL — chamado pelo renderer.js
// ============================================================
function drawPlayer(ctx, W, H){
  if(P.dead) return;

  // Pisca durante invencibilidade
  if(P.inv > 0 && Math.floor(P.inv / 6) % 2 === 0) return;

  var px = Math.round(P.x - camX);

  // Sprite map
  var sprMap = {0:'idle', 1:'run1', 2:'run2', 3:'jump', 4:'crouch'};
  var img    = IMGS[sprMap[P.animFrame]];
  if(!img) return;

  // Altura do sprite (crouch fica menor)
  var dH = (P.animFrame === 4) ? Math.round(GAB_H * 0.7) : GAB_H;
  var dW = Math.round(img.width * (dH / img.height));
  var bY = Math.round(P.y) + (P.h - dH);  // alinha os pés
  var bX = px + Math.round((P.w - dW) / 2);

  ctx.save();
  if(P.dir < 0){
    // Espelha horizontalmente
    ctx.translate(bX + dW, bY);
    ctx.scale(-1, 1);
    ctx.drawImage(img, 0, 0, dW, dH);
  } else {
    ctx.drawImage(img, bX, bY, dW, dH);
  }
  ctx.restore();
}

// ============================================================
// DESENHA PROJÉTEIS — chamado pelo renderer.js
// ============================================================
function drawBullets(ctx){
  var img = IMGS['ammo'];
  for(var i = 0; i < BULLETS.length; i++){
    var b  = BULLETS[i];
    var bx = Math.round(b.x - camX);
    if(img){
      ctx.drawImage(img, bx, Math.round(b.y), b.w * 2, b.h * 2);
    } else {
      // Fallback geométrico caso a imagem não carregue
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(bx, Math.round(b.y), b.w, b.h);
    }
  }
}
