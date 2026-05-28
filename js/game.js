// game.js — Loop principal, servidores, progressão de zonas
// Mundo: 96000px (3 zonas de 32000px cada)

var SERVERS = [];
var ZONE_TRANSITION = { active:false, timer:0, duration:150 };

var SERVER_TYPES = {
  normal: { hp:8,  w:60, h:90,  score:500  },
  boss:   { hp:30, w:90, h:120, score:5000 },
};

var SERVER_SPAWNS = [
  // ZONA 1 (0-32000) — 1 servidor a cada 4000px
  {x:3500,  y:GROUND_Y-90,  type:'normal', zone:1},
  {x:7500,  y:GROUND_Y-90,  type:'normal', zone:1},
  {x:11500, y:GROUND_Y-90,  type:'normal', zone:1},
  {x:15500, y:GROUND_Y-90,  type:'normal', zone:1},
  {x:19500, y:GROUND_Y-90,  type:'normal', zone:1},
  {x:23500, y:GROUND_Y-90,  type:'normal', zone:1},
  {x:27500, y:GROUND_Y-90,  type:'normal', zone:1},
  {x:31500, y:GROUND_Y-90,  type:'normal', zone:1},
  {x:31200, y:GROUND_Y-120, type:'boss',   zone:1},
  // ZONA 2 (32000-64000)
  {x:35500, y:GROUND_Y-90,  type:'normal', zone:2},
  {x:39500, y:GROUND_Y-90,  type:'normal', zone:2},
  {x:43500, y:GROUND_Y-90,  type:'normal', zone:2},
  {x:47500, y:GROUND_Y-90,  type:'normal', zone:2},
  {x:51500, y:GROUND_Y-90,  type:'normal', zone:2},
  {x:55500, y:GROUND_Y-90,  type:'normal', zone:2},
  {x:59500, y:GROUND_Y-90,  type:'normal', zone:2},
  {x:63500, y:GROUND_Y-90,  type:'normal', zone:2},
  {x:63200, y:GROUND_Y-120, type:'boss',   zone:2},
  // ZONA 3 (64000-96000)
  {x:67500, y:GROUND_Y-90,  type:'normal', zone:3},
  {x:71500, y:GROUND_Y-90,  type:'normal', zone:3},
  {x:75500, y:GROUND_Y-90,  type:'normal', zone:3},
  {x:79500, y:GROUND_Y-90,  type:'normal', zone:3},
  {x:83500, y:GROUND_Y-90,  type:'normal', zone:3},
  {x:87500, y:GROUND_Y-90,  type:'normal', zone:3},
  {x:91500, y:GROUND_Y-90,  type:'normal', zone:3},
  {x:95500, y:GROUND_Y-90,  type:'normal', zone:3},
  {x:95200, y:GROUND_Y-120, type:'boss',   zone:3},
];

function spawnServers(){
  SERVERS=[];
  for(var i=0;i<SERVER_SPAWNS.length;i++){
    var sp=SERVER_SPAWNS[i], type=SERVER_TYPES[sp.type];
    SERVERS.push({
      x:sp.x, y:sp.y, w:type.w, h:type.h,
      hp:type.hp, maxHp:type.hp,
      type:sp.type, zone:sp.zone, score:type.score,
      dead:false, inv:0, deadTimer:0,
      spawnCool:0, shootCool:0, glitch:0,
    });
  }
}

function updateServers(){
  for(var i=SERVERS.length-1;i>=0;i--){
    var s=SERVERS[i];
    if(s.dead){ s.deadTimer++; if(s.deadTimer>60)SERVERS.splice(i,1); continue; }
    if(s.x<camX-300||s.x>camX+1100) continue;
    if(s.inv>0) s.inv--;
    if(s.glitch>0) s.glitch--;
    if(s.type==='boss'){
      s.spawnCool++; if(s.spawnCool>=900){s.spawnCool=0;spawnBossGuard(s);}
      s.shootCool++; if(s.shootCool>=120){s.shootCool=0;fireBossShot(s);}
    }
    for(var j=BULLETS.length-1;j>=0;j--){
      var b=BULLETS[j];
      if(b.x+b.w>s.x&&b.x<s.x+s.w&&b.y+b.h>s.y&&b.y<s.y+s.h){
        hitServer(s); BULLETS.splice(j,1);
      }
    }
  }
  checkZoneProgress();
}

function hitServer(s){
  if(s.inv>0||s.dead) return;
  s.hp--; s.inv=15; s.glitch=15;
  if(s.hp<=0){
    s.dead=true; s.deadTimer=0; P.score+=s.score;
    if(s.type==='boss'&&s.zone===3) setTimeout(function(){GAME_STATE='win';},1500);
  }
}

function fireBossShot(s){
  var dir=(P.x-s.x)>0?1:-1;
  ENEMY_BULLETS.push({x:s.x+s.w/2,y:s.y+s.h*0.4,vx:dir*4,w:12,h:8,active:true});
}

function spawnBossGuard(s){
  var types=['light','normal','armored'];
  var tk=s.zone===1?'light':s.zone===2?'normal':types[Math.floor(Math.random()*3)];
  var type=ENEMY_TYPES[tk];
  ENEMIES.push({
    typeName:tk,key:type.key,
    x:s.x+(Math.random()>0.5?120:-120),y:GROUND_Y-type.h,
    vx:0,vy:0,w:type.w,h:type.h,onGround:false,
    hp:type.hp,maxHp:type.hp,speed:type.speed,
    detectRange:type.detectRange,attackRange:type.attackRange,
    damage:type.damage,score:type.score,
    canShoot:type.canShoot,shootCool:0,maxShootCool:type.shootCool,
    state:STATE_CHASE,dir:P.x>s.x?1:-1,
    spawnX:s.x,patrolDist:150,
    inv:0,deadTimer:0,bobTick:0,bobY:0,
    flipDefault:type.flipDefault||false,jumpCool:0,
  });
}

function checkZoneProgress(){
  if(ZONE_TRANSITION.active) return;
  var z=getZone(), aliveN=0, aliveB=0;
  for(var i=0;i<SERVERS.length;i++){
    var s=SERVERS[i];
    if(s.zone!==z||s.dead) continue;
    if(s.type==='normal') aliveN++;
    if(s.type==='boss')   aliveB++;
  }
  if(aliveN===0&&aliveB===0&&z<3){
    ZONE_TRANSITION.active=true; ZONE_TRANSITION.timer=0;
  }
}

function updateZoneTransition(ctx,W,H){
  if(!ZONE_TRANSITION.active) return;
  ZONE_TRANSITION.timer++;
  var t=ZONE_TRANSITION.timer, d=ZONE_TRANSITION.duration;
  var alpha=t<d*0.4?t/(d*0.4):t<d*0.6?1:1-(t-d*0.6)/(d*0.4);
  ctx.fillStyle='rgba(0,0,0,'+Math.min(1,alpha)+')';
  ctx.fillRect(0,0,W,H);
  if(t>d*0.35&&t<d*0.65){
    var nz=getZone()<3?getZone()+1:3;
    var names={1:'ZONA 1',2:'ZONA 2 — Laboratório',3:'ZONA 3 — Datacenter NEXCORP'};
    ctx.textAlign='center';
    ctx.fillStyle='#00FF88'; ctx.font='bold 11px "Courier New",monospace';
    ctx.fillText('ÁREA LIBERADA — AVANÇANDO PARA',W/2,H/2-20);
    ctx.fillStyle='#FFFFFF'; ctx.font='bold 20px "Courier New",monospace';
    ctx.fillText(names[nz],W/2,H/2+10);
    ctx.textAlign='left';
    if(t===Math.floor(d*0.5)){
      var zStart=nz===2?32500:64500;
      P.x=zStart; P.y=GROUND_Y-P.h; P.vx=0; P.vy=0;
      camX=Math.max(0,P.x-250);
    }
  }
  if(t>=d){ZONE_TRANSITION.active=false;ZONE_TRANSITION.timer=0;}
}

function drawServers(ctx){
  for(var i=0;i<SERVERS.length;i++){
    var s=SERVERS[i], sx=Math.round(s.x-camX);
    if(sx+s.w<-10||sx>810) continue;
    if(s.dead){
      ctx.globalAlpha=Math.max(0,1-s.deadTimer/30);
      drawExplosion(ctx,sx+s.w/2,s.y+s.h/2,s.deadTimer);
      ctx.globalAlpha=1; continue;
    }
    var goff=s.glitch>0?Math.floor(Math.random()*6)-3:0;
    var img=IMGS['server'];
    if(img){
      ctx.save();
      if(s.glitch>0) ctx.filter='hue-rotate(180deg) brightness(2)';
      ctx.drawImage(img,sx+goff,Math.round(s.y),s.w,s.h);
      ctx.filter='none'; ctx.restore();
    } else {
      ctx.fillStyle=s.glitch>0?'#FFF':(s.type==='boss'?'#00FFAA':'#00CC88');
      ctx.fillRect(sx,Math.round(s.y),s.w,s.h);
    }
    drawServerHP(ctx,s,sx);
    if(s.type==='boss'){
      ctx.fillStyle='#FF4444'; ctx.font='bold 9px "Courier New",monospace';
      ctx.textAlign='center'; ctx.fillText('⚠ BOSS',sx+s.w/2,Math.round(s.y)-12); ctx.textAlign='left';
    }
  }
}

function drawServerHP(ctx,s,sx){
  var bw=s.w, bh=s.type==='boss'?6:4, by=Math.round(s.y)-(s.type==='boss'?20:10);
  var pct=s.hp/s.maxHp;
  ctx.fillStyle='rgba(0,0,0,0.7)'; ctx.fillRect(sx,by,bw,bh);
  ctx.fillStyle=pct>0.6?'#00FF88':pct>0.3?'#FFAA00':'#FF3300';
  ctx.fillRect(sx,by,Math.round(bw*pct),bh);
}

function drawExplosion(ctx,cx,cy,timer){
  var r=timer*3, alpha=Math.max(0,1-timer/30);
  ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2);
  ctx.fillStyle='rgba(255,150,0,'+alpha*0.5+')'; ctx.fill();
  ctx.beginPath(); ctx.arc(cx,cy,r*0.5,0,Math.PI*2);
  ctx.fillStyle='rgba(255,255,100,'+alpha+')'; ctx.fill();
  for(var p=0;p<8;p++){
    var a=(p/8)*Math.PI*2, d=timer*4;
    ctx.beginPath(); ctx.arc(cx+Math.cos(a)*d,cy+Math.sin(a)*d,3,0,Math.PI*2);
    ctx.fillStyle='rgba(255,100,0,'+alpha+')'; ctx.fill();
  }
}

function drawBossHPBar(ctx,W,H){
  var z=getZone(), boss=null;
  for(var i=0;i<SERVERS.length;i++){
    if(SERVERS[i].type==='boss'&&SERVERS[i].zone===z&&!SERVERS[i].dead){boss=SERVERS[i];break;}
  }
  if(!boss||boss.x<camX-100||boss.x>camX+900) return;
  var bw=300,bh=14,bx=(W-bw)/2,by=35,pct=boss.hp/boss.maxHp;
  ctx.fillStyle='rgba(0,0,0,0.8)'; ctx.fillRect(bx-2,by-2,bw+4,bh+4);
  ctx.fillStyle=pct>0.5?'#FF4400':pct>0.25?'#FF8800':'#FF0000';
  ctx.fillRect(bx,by,Math.round(bw*pct),bh);
  ctx.strokeStyle='#FF4444'; ctx.lineWidth=1.5; ctx.strokeRect(bx,by,bw,bh);
  ctx.fillStyle='#FF4444'; ctx.font='bold 10px "Courier New",monospace';
  ctx.textAlign='center'; ctx.fillText('⚠ SERVIDOR NEXCORP — ZONA '+z,W/2,by-4); ctx.textAlign='left';
}

function drawServerCount(ctx,W,H){
  var z=getZone(), total=0, alive=0;
  for(var i=0;i<SERVERS.length;i++){
    var s=SERVERS[i];
    if(s.zone!==z||s.type!=='normal') continue;
    total++; if(!s.dead) alive++;
  }
  ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.fillRect(W-130,30,122,22);
  ctx.fillStyle='#00FF88'; ctx.font='bold 10px "Courier New",monospace';
  ctx.textAlign='right';
  ctx.fillText('SERVIDORES: '+(total-alive)+'/'+total,W-8,44);
  ctx.textAlign='left';
}

function gameLoop(ctx,W,H){
  if(GAME_STATE!=='playing'){
    ctx.clearRect(0,0,W,H); drawScreen(ctx,W,H); return;
  }
  if(P.dead){
    GAMEOVER.timer=0; GAMEOVER.showRetry=false; GAME_STATE='gameover'; return;
  }
  renderScene(ctx,W,H);
  updateServers(); drawServers(ctx);
  for(var i=BULLETS.length-1;i>=0;i--){
    var b=BULLETS[i];
    for(var j=0;j<ENEMIES.length;j++){
      var e=ENEMIES[j];
      if(e.state===STATE_DEAD) continue;
      if(b.x+b.w>e.x&&b.x<e.x+e.w&&b.y+b.h>e.y&&b.y<e.y+e.h){
        hitEnemy(e); BULLETS.splice(i,1); break;
      }
    }
  }
  updatePlayer(); updateEnemies();
  drawEnemies(ctx); drawPlayer(ctx); drawBullets(ctx);
  drawHUD(ctx,W,H); drawBossHPBar(ctx,W,H); drawServerCount(ctx,W,H);
  updateZoneTransition(ctx,W,H);
}
