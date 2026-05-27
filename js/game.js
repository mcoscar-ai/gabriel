// ============================================================
// game.js — Loop principal, servidores, progressão de zonas
// Requer: todos os módulos anteriores
// ============================================================

// ============================================================
// SERVIDORES
// ============================================================
var SERVERS = [];
var ZONE_TRANSITION = { active: false, timer: 0, duration: 120 };

var SERVER_TYPES = {
  normal: { hp: 8,  w: 48, h: 64, score: 500  },
  boss:   { hp: 25, w: 80, h: 96, score: 3000 },
};

// Posições dos servidores
var SERVER_SPAWNS = [
  // ZONA 1
  {x:300,  y:GROUND_Y-64,  type:'normal', zone:1},
  {x:480,  y:GROUND_Y-64,  type:'normal', zone:1},
  {x:660,  y:GROUND_Y-64,  type:'normal', zone:1},
  {x:820,  y:GROUND_Y-64,  type:'normal', zone:1},
  {x:900,  y:GROUND_Y-64,  type:'normal', zone:1},
  {x:1020, y:GROUND_Y-64,  type:'normal', zone:1},
  {x:1150, y:GROUND_Y-64,  type:'normal', zone:1},
  {x:1280, y:GROUND_Y-96,  type:'boss',   zone:1},

  // ZONA 2
  {x:1450, y:GROUND_Y-64,  type:'normal', zone:2},
  {x:1620, y:GROUND_Y-64,  type:'normal', zone:2},
  {x:1800, y:GROUND_Y-64,  type:'normal', zone:2},
  {x:1980, y:GROUND_Y-64,  type:'normal', zone:2},
  {x:2100, y:GROUND_Y-64,  type:'normal', zone:2},
  {x:2250, y:GROUND_Y-64,  type:'normal', zone:2},
  {x:2430, y:GROUND_Y-64,  type:'normal', zone:2},
  {x:2580, y:GROUND_Y-96,  type:'boss',   zone:2},

  // ZONA 3
  {x:2750, y:GROUND_Y-64,  type:'normal', zone:3},
  {x:2920, y:GROUND_Y-64,  type:'normal', zone:3},
  {x:3100, y:GROUND_Y-64,  type:'normal', zone:3},
  {x:3250, y:GROUND_Y-64,  type:'normal', zone:3},
  {x:3400, y:GROUND_Y-64,  type:'normal', zone:3},
  {x:3550, y:GROUND_Y-64,  type:'normal', zone:3},
  {x:3700, y:GROUND_Y-64,  type:'normal', zone:3},
  {x:3850, y:GROUND_Y-96,  type:'boss',   zone:3},
];

function spawnServers(){
  SERVERS = [];
  for(var i = 0; i < SERVER_SPAWNS.length; i++){
    var sp   = SERVER_SPAWNS[i];
    var type = SERVER_TYPES[sp.type];
    SERVERS.push({
      x:        sp.x,
      y:        sp.y,
      w:        type.w,
      h:        type.h,
      hp:       type.hp,
      maxHp:    type.hp,
      type:     sp.type,
      zone:     sp.zone,
      score:    type.score,
      dead:     false,
      inv:      0,        // pisca ao levar hit
      deadTimer:0,
      // Boss
      spawnCool: 0,       // cooldown de spawn de guardas
      shootCool: 0,       // cooldown de tiro do boss
      // Animação
      glitch:   0,        // efeito glitch ao levar hit
    });
  }
}

// ============================================================
// ATUALIZA SERVIDORES
// ============================================================
function updateServers(){
  for(var i = SERVERS.length - 1; i >= 0; i--){
    var s = SERVERS[i];
    if(s.dead){
      s.deadTimer++;
      if(s.deadTimer > 60) SERVERS.splice(i, 1);
      continue;
    }

    // Só atualiza se próximo da câmera
    if(s.x < camX - 200 || s.x > camX + 1000) continue;

    if(s.inv > 0) s.inv--;
    if(s.glitch > 0) s.glitch--;

    // Boss — comportamentos especiais
    if(s.type === 'boss'){
      // Spawna guardas a cada 15 segundos
      s.spawnCool++;
      if(s.spawnCool >= 900){
        s.spawnCool = 0;
        spawnBossGuard(s);
      }

      // Atira projéteis a cada 2 segundos
      s.shootCool++;
      if(s.shootCool >= 120){
        s.shootCool = 0;
        fireBossShot(s);
      }
    }

    // Colisão com balas do player
    for(var j = BULLETS.length - 1; j >= 0; j--){
      var b = BULLETS[j];
      if(b.x + b.w > s.x && b.x < s.x + s.w &&
         b.y + b.h > s.y && b.y < s.y + s.h){
        hitServer(s);
        BULLETS.splice(j, 1);
      }
    }
  }

  // Verifica progressão de zona
  checkZoneProgress();
}

function hitServer(s){
  if(s.inv > 0 || s.dead) return;
  s.hp--;
  s.inv   = 15;
  s.glitch = 15;

  if(s.hp <= 0){
    s.dead     = true;
    s.deadTimer = 0;
    P.score   += s.score;

    // Boss morreu — verifica vitória
    if(s.type === 'boss' && s.zone === 3){
      setTimeout(function(){ GAME_STATE = 'win'; }, 1500);
    }
  }
}

// ============================================================
// BOSS — TIRO E SPAWN DE GUARDAS
// ============================================================
function fireBossShot(s){
  var dx = P.x - s.x;
  var dir = dx > 0 ? 1 : -1;
  ENEMY_BULLETS.push({
    x:  s.x + s.w/2,
    y:  s.y + s.h * 0.4,
    vx: dir * 4,
    w:  12, h: 8,
    active: true,
  });
}

function spawnBossGuard(s){
  var types   = ['light', 'normal', 'armored'];
  var zone    = s.zone;
  var typeKey = zone === 1 ? 'light' : zone === 2 ? 'normal' : types[Math.floor(Math.random()*3)];
  var type    = ENEMY_TYPES[typeKey];

  ENEMIES.push({
    typeName:   typeKey,
    key:        type.key,
    x:          s.x + (Math.random() > 0.5 ? 100 : -100),
    y:          GROUND_Y - type.h,
    vx:         0, vy:0,
    w:          type.w, h: type.h,
    onGround:   false,
    hp:         type.hp, maxHp: type.hp,
    speed:      type.speed,
    detectRange:type.detectRange,
    attackRange:type.attackRange,
    damage:     type.damage,
    score:      type.score,
    canShoot:   type.canShoot,
    shootCool:  0, maxShootCool: type.shootCool,
    state:      STATE_CHASE, // já começa perseguindo
    dir:        P.x > s.x ? 1 : -1,
    spawnX:     s.x,
    patrolDist: 150,
    inv:        0, deadTimer:0,
    bobTick:    0, bobY:0,
    flipDefault:type.flipDefault || false,
    jumpCool:   0,
  });
}

// ============================================================
// VERIFICA PROGRESSÃO DE ZONA
// ============================================================
function checkZoneProgress(){
  if(ZONE_TRANSITION.active) return;

  var currentZone = getZone();

  // Conta servidores vivos desta zona
  var aliveNormal = 0;
  var aliveBoss   = 0;

  for(var i = 0; i < SERVERS.length; i++){
    var s = SERVERS[i];
    if(s.zone === currentZone && !s.dead){
      if(s.type === 'normal') aliveNormal++;
      if(s.type === 'boss')   aliveBoss++;
    }
  }

  // Boss só pode ser destruído após todos os normais
  // (bloqueia balas no boss se ainda tem normais vivos)
  // Zona completa quando boss também morreu
  if(aliveNormal === 0 && aliveBoss === 0 && currentZone < 3){
    startZoneTransition(currentZone);
  }
}

function startZoneTransition(fromZone){
  ZONE_TRANSITION.active = true;
  ZONE_TRANSITION.timer  = 0;
}

function updateZoneTransition(ctx, W, H){
  if(!ZONE_TRANSITION.active) return;

  ZONE_TRANSITION.timer++;
  var t = ZONE_TRANSITION.timer;
  var d = ZONE_TRANSITION.duration;

  // Fade escuro
  var alpha = 0;
  if(t < d * 0.4)      alpha = t / (d * 0.4);
  else if(t < d * 0.6) alpha = 1;
  else                  alpha = 1 - (t - d * 0.6) / (d * 0.4);

  ctx.fillStyle = 'rgba(0,0,0,' + Math.min(1, alpha) + ')';
  ctx.fillRect(0, 0, W, H);

  // Texto de próxima zona no meio do fade
  if(t > d * 0.35 && t < d * 0.65){
    var nextZone = getZone() < 3 ? getZone() + 1 : 3;
    var names    = {1:'ZONA 1 — Beto Carrero', 2:'ZONA 2 — Laboratório', 3:'ZONA 3 — Datacenter NEXCORP'};
    ctx.textAlign   = 'center';
    ctx.fillStyle   = '#00FF88';
    ctx.font        = 'bold 11px "Courier New", monospace';
    ctx.fillText('ÁREA LIBERADA', W/2, H/2 - 20);
    ctx.fillStyle   = '#FFFFFF';
    ctx.font        = 'bold 18px "Courier New", monospace';
    ctx.fillText(names[nextZone], W/2, H/2 + 10);
    ctx.textAlign   = 'left';

    // Move câmera para próxima zona
    if(t === Math.floor(d * 0.5)){
      var zoneStart = nextZone === 2 ? 1400 : 2750;
      P.x   = zoneStart - 200;
      P.y   = GROUND_Y - P.h;
      P.vx  = 0; P.vy = 0;
      camX  = Math.max(0, P.x - 250);
    }
  }

  if(t >= d){
    ZONE_TRANSITION.active = false;
    ZONE_TRANSITION.timer  = 0;
  }
}

// ============================================================
// DESENHA SERVIDORES
// ============================================================
function drawServers(ctx){
  for(var i = 0; i < SERVERS.length; i++){
    var s  = SERVERS[i];
    var sx = Math.round(s.x - camX);

    if(sx + s.w < -10 || sx > 810) continue;

    var img = IMGS['server'];

    if(s.dead){
      // Explosão — fade out
      ctx.globalAlpha = Math.max(0, 1 - s.deadTimer / 30);
      drawExplosion(ctx, sx + s.w/2, s.y + s.h/2, s.deadTimer);
      ctx.globalAlpha = 1;
      continue;
    }

    // Efeito glitch ao levar hit
    var glitchOff = s.glitch > 0 ? Math.floor(Math.random() * 6) - 3 : 0;

    if(img){
      ctx.save();
      if(s.glitch > 0){
        ctx.filter = 'hue-rotate(180deg) brightness(2)';
      }
      ctx.drawImage(img, sx + glitchOff, Math.round(s.y), s.w, s.h);
      ctx.filter = 'none';
      ctx.restore();
    } else {
      // Fallback geométrico
      var col = s.type === 'boss' ? '#00FFAA' : '#00CC88';
      ctx.fillStyle = s.glitch > 0 ? '#FFFFFF' : col;
      ctx.fillRect(sx, Math.round(s.y), s.w, s.h);
      // Detalhes
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      for(var r = 0; r < 4; r++){
        ctx.fillRect(sx + 6, Math.round(s.y) + 8 + r * 14, s.w - 12, 6);
      }
      // Luz piscando
      ctx.fillStyle = (Math.floor(Date.now()/200)%2===0) ? '#00FF88' : '#005533';
      ctx.fillRect(sx + s.w - 14, Math.round(s.y) + 8, 8, 8);
    }

    // Barra de HP
    drawServerHP(ctx, s, sx);

    // Label BOSS
    if(s.type === 'boss'){
      ctx.fillStyle   = '#FF4444';
      ctx.font        = 'bold 9px "Courier New", monospace';
      ctx.textAlign   = 'center';
      ctx.fillText('⚠ BOSS', sx + s.w/2, Math.round(s.y) - 12);
      ctx.textAlign   = 'left';
    }
  }
}

function drawServerHP(ctx, s, sx){
  var bw  = s.w;
  var bh  = s.type === 'boss' ? 6 : 4;
  var by  = Math.round(s.y) - (s.type === 'boss' ? 20 : 10);
  var pct = s.hp / s.maxHp;

  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(sx, by, bw, bh);

  ctx.fillStyle = pct > 0.6 ? '#00FF88' : pct > 0.3 ? '#FFAA00' : '#FF3300';
  ctx.fillRect(sx, by, Math.round(bw * pct), bh);
}

function drawExplosion(ctx, cx, cy, timer){
  var r = timer * 3;
  var alpha = Math.max(0, 1 - timer/30);

  // Círculo externo
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI*2);
  ctx.fillStyle = 'rgba(255,150,0,' + alpha * 0.5 + ')';
  ctx.fill();

  // Círculo interno
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.5, 0, Math.PI*2);
  ctx.fillStyle = 'rgba(255,255,100,' + alpha + ')';
  ctx.fill();

  // Partículas
  for(var p = 0; p < 8; p++){
    var angle = (p / 8) * Math.PI * 2;
    var dist  = timer * 4;
    ctx.beginPath();
    ctx.arc(
      cx + Math.cos(angle) * dist,
      cy + Math.sin(angle) * dist,
      3, 0, Math.PI*2
    );
    ctx.fillStyle = 'rgba(255,100,0,' + alpha + ')';
    ctx.fill();
  }
}

// ============================================================
// BARRA DE HP DO BOSS — visível no HUD
// ============================================================
function drawBossHPBar(ctx, W, H){
  // Encontra boss da zona atual
  var zone = getZone();
  var boss = null;
  for(var i = 0; i < SERVERS.length; i++){
    if(SERVERS[i].type === 'boss' && SERVERS[i].zone === zone && !SERVERS[i].dead){
      boss = SERVERS[i];
      break;
    }
  }
  if(!boss) return;

  // Só mostra se boss está próximo da câmera
  if(boss.x < camX - 100 || boss.x > camX + 900) return;

  var bw   = 300;
  var bh   = 14;
  var bx   = (W - bw) / 2;
  var by   = 35;
  var pct  = boss.hp / boss.maxHp;

  // Fundo
  ctx.fillStyle = 'rgba(0,0,0,0.8)';
  ctx.fillRect(bx - 2, by - 2, bw + 4, bh + 4);

  // Barra
  ctx.fillStyle = pct > 0.5 ? '#FF4400' : pct > 0.25 ? '#FF8800' : '#FF0000';
  ctx.fillRect(bx, by, Math.round(bw * pct), bh);

  // Borda
  ctx.strokeStyle = '#FF4444';
  ctx.lineWidth   = 1.5;
  ctx.strokeRect(bx, by, bw, bh);

  // Label
  ctx.fillStyle   = '#FF4444';
  ctx.font        = 'bold 10px "Courier New", monospace';
  ctx.textAlign   = 'center';
  ctx.fillText('⚠ SERVIDOR NEXCORP — ZONA ' + zone, W/2, by - 4);
  ctx.textAlign   = 'left';
}

// ============================================================
// CONTADOR DE SERVIDORES NA TELA
// ============================================================
function drawServerCount(ctx, W, H){
  var zone    = getZone();
  var total   = 0;
  var alive   = 0;
  var bossAlive = false;

  for(var i = 0; i < SERVERS.length; i++){
    var s = SERVERS[i];
    if(s.zone !== zone) continue;
    if(s.type === 'normal'){
      total++;
      if(!s.dead) alive++;
    }
    if(s.type === 'boss' && !s.dead) bossAlive = true;
  }

  var destroyed = total - alive;

  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(W - 130, 30, 122, 22);

  ctx.fillStyle = '#00FF88';
  ctx.font      = 'bold 10px "Courier New", monospace';
  ctx.textAlign = 'right';
  ctx.fillText('SERVIDORES: ' + destroyed + '/' + total, W - 8, 44);
  ctx.textAlign = 'left';
}

// ============================================================
// LOOP PRINCIPAL FINAL
// ============================================================
function gameLoop(ctx, W, H){
  if(GAME_STATE !== 'playing'){
    ctx.clearRect(0, 0, W, H);
    drawScreen(ctx, W, H);
    return;
  }

  // Game over
  if(P.dead){
    GAMEOVER.timer     = 0;
    GAMEOVER.showRetry = false;
    GAME_STATE         = 'gameover';
    return;
  }

  // Render cenário
  renderScene(ctx, W, H);

  // Servidores
  updateServers();
  drawServers(ctx);

  // Colisão balas player → inimigos
  for(var i = BULLETS.length - 1; i >= 0; i--){
    var b = BULLETS[i];
    for(var j = 0; j < ENEMIES.length; j++){
      var e = ENEMIES[j];
      if(e.state === STATE_DEAD) continue;
      if(b.x+b.w > e.x && b.x < e.x+e.w &&
         b.y+b.h > e.y && b.y < e.y+e.h){
        hitEnemy(e);
        BULLETS.splice(i, 1);
        break;
      }
    }
  }

  updatePlayer();
  updateEnemies();
  drawEnemies(ctx);
  drawPlayer(ctx);
  drawBullets(ctx);

  // HUD
  drawHUD(ctx, W, H);
  drawBossHPBar(ctx, W, H);
  drawServerCount(ctx, W, H);

  // Transição de zona
  updateZoneTransition(ctx, W, H);
}
