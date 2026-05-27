// ============================================================
// enemies.js — Inimigos com FSM (Finite State Machine)
// Estados: PATROL, CHASE, ATTACK, DEAD
// Requer: assets.js, player.js, renderer.js
// ============================================================

// Estados da FSM
var STATE_PATROL = 'patrol';
var STATE_CHASE  = 'chase';
var STATE_ATTACK = 'attack';
var STATE_DEAD   = 'dead';

// Array global de inimigos
var ENEMIES = [];

// Projéteis dos inimigos
var ENEMY_BULLETS = [];

// ============================================================
// DEFINIÇÕES DOS TIPOS DE INIMIGO
// ============================================================
var ENEMY_TYPES = {
  light: {
    key:        'guard_light',
    hp:         2,
    speed:      2.8,
    detectRange:220,
    attackRange:50,
    damage:     1,
    score:      100,
    canShoot:   false,
    shootCool:  0,
    w:          40,
    h:          110,
  },
  normal: {
    key:        'guard_normal',
    hp:         6,
    speed:      1.8,
    detectRange:280,
    attackRange:200,
    damage:     1,
    score:      200,
    canShoot:   true,
    shootCool:  90,
    w:          44,
    h:          115,
    flipDefault: true,
  },
  armored: {
    key:        'guard_armored',
    hp:         8,
    speed:      1.0,
    detectRange:180,
    attackRange:40,
    damage:     2,
    score:      400,
    canShoot:   false,
    shootCool:  0,
    w:          50,
    h:          120,
  },
};

// ============================================================
// SPAWN — cria inimigos distribuídos pelo mapa
// ============================================================
function spawnEnemies(){
  ENEMIES = [];

  // Zona 1 (0 - 1333): light e normal
  var z1 = [
    {type:'light',  x:500},
    {type:'normal', x:800},
    {type:'light',  x:1100},
    {type:'normal', x:1250},
  ];

  // Zona 2 (1333 - 2666): normal e armored
  var z2 = [
    {type:'normal',  x:1500},
    {type:'armored', x:1800},
    {type:'normal',  x:2100},
    {type:'armored', x:2500},
  ];

  // Zona 3 (2666 - 4000): todos
  var z3 = [
    {type:'light',   x:2800},
    {type:'normal',  x:3000},
    {type:'armored', x:3200},
    {type:'normal',  x:3400},
    {type:'armored', x:3700},
    {type:'light',   x:3900},
  ];

  var all = z1.concat(z2).concat(z3);

  for(var i = 0; i < all.length; i++){
    var def  = all[i];
    var type = ENEMY_TYPES[def.type];
    ENEMIES.push({
      // Tipo e visual
      typeName:   def.type,
      key:        type.key,
      // Posição e física
      x:          def.x,
      y:          GROUND_Y - type.h,
      vx:         0,
      vy:         0,
      w:          type.w,
      h:          type.h,
      onGround:   false,
      // Stats
      hp:         type.hp,
      maxHp:      type.hp,
      speed:      type.speed,
      detectRange:type.detectRange,
      attackRange:type.attackRange,
      damage:     type.damage,
      score:      type.score,
      canShoot:   type.canShoot,
      shootCool:  0,
      maxShootCool: type.shootCool,
      // FSM
      state:      STATE_PATROL,
      dir:        1,            // começa indo para direita
      spawnX:     def.x,        // ponto de spawn para patrulha
      patrolDist: 120,          // distância de patrulha do spawn
      flipDefault: type.flipDefault || false,
      // Visual
      inv:        0,            // frames de invencibilidade ao levar hit
      deadTimer:  0,            // timer para remover após morte
      // Animação simples (bob)
      bobTick:    Math.floor(Math.random() * 30), // offset aleatório
      bobY:       0,
    });
  }
}

// ============================================================
// ATUALIZA TODOS OS INIMIGOS
// ============================================================
function updateEnemies(){
  for(var i = ENEMIES.length - 1; i >= 0; i--){
    var e = ENEMIES[i];

    // Remove inimigos mortos após animação
    if(e.state === STATE_DEAD){
      e.deadTimer++;
      if(e.deadTimer > 40) ENEMIES.splice(i, 1);
      continue;
    }

    // Só atualiza inimigos próximos da câmera (otimização)
    if(e.x < camX - 300 || e.x > camX + 1100) continue;

    // Invencibilidade
    if(e.inv > 0) e.inv--;

    // Distância ao player
    var dx   = P.x - e.x;
    var dist = Math.abs(dx);
    var sameDir = (dx > 0 && e.dir > 0) || (dx < 0 && e.dir < 0);

    // ---- FSM ----
    switch(e.state){

      case STATE_PATROL:
        // Anda entre spawnX - patrolDist e spawnX + patrolDist
        e.vx = e.dir * e.speed;

        // Vira ao chegar no limite da patrulha
        if(e.x < e.spawnX - e.patrolDist) e.dir =  1;
        if(e.x > e.spawnX + e.patrolDist) e.dir = -1;

        // Detecta player — só se estiver na direção que olha
        if(dist < e.detectRange && sameDir && !P.dead){
          e.state = STATE_CHASE;
        }
        // Animação bob suave
        e.bobTick++;
        e.bobY = Math.sin(e.bobTick * 0.15) * 2;
        break;

      case STATE_CHASE:
        // Persegue o player
        e.dir = dx > 0 ? 1 : -1;
        e.vx  = e.dir * e.speed * 1.3;

        // Guard light salta em direção ao Gabriel — só a cada 90 frames
        if(e.typeName === 'light' && dist < 180 && e.onGround){
          if(!e.jumpCool || e.jumpCool <= 0){
            e.vy       = -10;
            e.jumpCool = 90;
          }
        }
        if(e.jumpCool > 0) e.jumpCool--;

        // Animação bob mais rápido ao correr
        e.bobTick++;
        e.bobY = Math.sin(e.bobTick * 0.25) * 3;

        // Perdeu o player — volta a patrulhar
        if(dist > e.detectRange * 1.5 || P.dead){
          e.state = STATE_PATROL;
          e.vx    = 0;
        }

        // Chegou no alcance de ataque
        if(dist < e.attackRange){
          e.state = STATE_ATTACK;
          e.vx    = 0;
        }
        break;

      case STATE_ATTACK:
        e.vx = 0;
        e.dir = dx > 0 ? 1 : -1;
        e.bobY = 0;

        if(e.canShoot){
          // Guarda normal — atira
          e.shootCool--;
          if(e.shootCool <= 0){
            fireEnemyBullet(e);
            e.shootCool = e.maxShootCool;
          }
          // Se player fugiu do alcance, volta a perseguir
          if(dist > e.attackRange * 1.2){
            e.state = STATE_CHASE;
          }
        } else {
          // Corpo a corpo — dano ao tocar player
          if(dist < e.attackRange){
            if(!P.dead) playerHit(false);
          }
          // Se player fugiu, persegue
          if(dist > e.attackRange * 1.5){
            e.state = STATE_CHASE;
          }
        }

        // Perdeu o player
        if(dist > e.detectRange * 1.5 || P.dead){
          e.state = STATE_PATROL;
        }
        break;
    }

    // ---- FÍSICA ----
    // Gravidade
    e.vy += 0.6;
    if(e.vy > 14) e.vy = 14;

    e.x += e.vx;
    e.y += e.vy;

    // Limites do mundo
    if(e.x < 0)        e.x = 0;
    if(e.x > GW - e.w) e.x = GW - e.w;

    // Colisão com chão
    e.onGround = false;
    if(e.vy >= 0 && e.y + e.h >= GROUND_Y){
      e.y        = GROUND_Y - e.h;
      e.vy       = 0;
      e.onGround = true;
    }

    // Colisão com plataformas
    if(e.vy >= 0){
      for(var j = 0; j < PLATFORMS.length; j++){
        var pl   = PLATFORMS[j];
        var prev = e.y + e.h - e.vy;
        if(e.x + e.w - 4 > pl.x &&
           e.x + 4        < pl.x + pl.w &&
           prev           <= pl.y &&
           e.y + e.h      >= pl.y){
          e.y        = pl.y - e.h;
          e.vy       = 0;
          e.onGround = true;
        }
      }
    }
  }

  // Atualiza projéteis dos inimigos
  updateEnemyBullets();
}

// ============================================================
// TIRO DOS INIMIGOS
// ============================================================
function fireEnemyBullet(e){
  ENEMY_BULLETS.push({
    x:  e.dir === 1 ? e.x + e.w : e.x - 10,
    y:  e.y + e.h * 0.4,
    vx: e.dir * 5,
    w:  10,
    h:  5,
    active: true,
  });
}

function updateEnemyBullets(){
  for(var i = ENEMY_BULLETS.length - 1; i >= 0; i--){
    var b = ENEMY_BULLETS[i];
    if(!b.active){ ENEMY_BULLETS.splice(i, 1); continue; }
    b.x += b.vx;

    // Remove se sair da tela
    if(b.x < camX - 50 || b.x > camX + 850){
      ENEMY_BULLETS.splice(i, 1);
      continue;
    }

    // Acerta o player
    if(!P.dead && P.inv === 0){
      if(b.x + b.w > P.x && b.x < P.x + P.w &&
         b.y + b.h > P.y && b.y < P.y + P.h){
        playerHit(false);
        ENEMY_BULLETS.splice(i, 1);
      }
    }
  }
}

// ============================================================
// INIMIGO LEVA DANO (chamado pelo physics.js)
// ============================================================
function hitEnemy(e){
  if(e.inv > 0 || e.state === STATE_DEAD) return;
  e.hp--;
  e.inv = 20; // pisca por 20 frames

  if(e.hp <= 0){
    e.state     = STATE_DEAD;
    e.deadTimer = 0;
    e.vx        = 0;
    P.score    += e.score;
  } else {
    // Leva hit mas não morreu — vai para CHASE
    e.state = STATE_CHASE;
  }
}

// ============================================================
// DESENHA INIMIGOS
// ============================================================
function drawEnemies(ctx){
  for(var i = 0; i < ENEMIES.length; i++){
    var e  = ENEMIES[i];
    var sx = Math.round(e.x - camX);

    // Culling
    if(sx + e.w < -10 || sx > 810) continue;

    // Pisca ao levar hit
    if(e.inv > 0 && Math.floor(e.inv / 4) % 2 === 0) continue;

    var img = IMGS[e.key];

    if(e.state === STATE_DEAD){
      // Morreu — desenha com transparência crescente
      ctx.globalAlpha = 1 - (e.deadTimer / 40);
    }

    if(img){
      var dH  = e.h;
      var dW  = Math.round(img.width * (dH / img.height));
      var bX  = sx + Math.round((e.w - dW) / 2);
      var bY  = Math.round(e.y + e.bobY) + (e.h - dH);
      var flip = e.flipDefault ? (e.dir > 0) : (e.dir < 0);
      ctx.save();
      if(flip){
        ctx.translate(bX + dW, bY);
        ctx.scale(-1, 1);
        ctx.drawImage(img, 0, 0, dW, dH);
      } else {
        ctx.drawImage(img, bX, bY, dW, dH);
      }
      ctx.restore();
    } else {
      // Fallback geométrico
      var colors = {light:'#ff6644', normal:'#ff4444', armored:'#884444'};
      ctx.fillStyle = colors[e.typeName] || '#ff4444';
      ctx.fillRect(sx, Math.round(e.y), e.w, e.h);
    }

    ctx.globalAlpha = 1;

    // Barra de HP — só para armored e normal
    if(e.typeName !== 'light' && e.state !== STATE_DEAD){
      drawEnemyHP(ctx, e, sx);
    }
  }

  // Desenha projéteis dos inimigos
  drawEnemyBullets(ctx);
}

function drawEnemyHP(ctx, e, sx){
  var bw  = e.w;
  var bh  = 4;
  var by  = Math.round(e.y) - 8;
  var pct = e.hp / e.maxHp;

  // Fundo
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(sx, by, bw, bh);

  // Barra
  ctx.fillStyle = pct > 0.5 ? '#00cc44' : pct > 0.25 ? '#ffaa00' : '#ff3300';
  ctx.fillRect(sx, by, Math.round(bw * pct), bh);
}

function drawEnemyBullets(ctx){
  ctx.fillStyle = '#ff6600';
  for(var i = 0; i < ENEMY_BULLETS.length; i++){
    var b  = ENEMY_BULLETS[i];
    var bx = Math.round(b.x - camX);
    ctx.fillStyle = '#ff6600';
    ctx.fillRect(bx, Math.round(b.y), b.w, b.h);
    // Glow
    ctx.fillStyle = 'rgba(255,100,0,0.3)';
    ctx.fillRect(bx - 2, Math.round(b.y) - 2, b.w + 4, b.h + 4);
  }
}
