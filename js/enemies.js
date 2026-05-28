// enemies.js — 135 inimigos + drone + spray de pimenta
var STATE_PATROL='patrol',STATE_CHASE='chase',STATE_ATTACK='attack',STATE_DEAD='dead',STATE_FLEE='flee';
var ENEMIES=[],ENEMY_BULLETS=[],PEPPER_CLOUDS=[];

var ENEMY_TYPES={
  light:{key:'guard_light',hp:2,speed:2.8,detectRange:220,attackRange:50,damage:1,score:100,canShoot:false,shootCool:0,w:40,h:110,flipDefault:false},
  normal:{key:'guard_normal',hp:6,speed:1.8,detectRange:280,attackRange:200,damage:1,score:200,canShoot:true,shootCool:90,w:44,h:115,flipDefault:true},
  armored:{key:'guard_armored',hp:8,speed:1.0,detectRange:180,attackRange:120,damage:2,score:400,canShoot:false,shootCool:0,w:50,h:120,flipDefault:false},
  drone:{key:'drone',hp:3,speed:2.0,detectRange:300,attackRange:250,damage:1,score:300,canShoot:true,shootCool:60,w:60,h:40,flipDefault:false,flying:true,flyY:120},
};

function spawnEnemies(){
  ENEMIES=[];PEPPER_CLOUDS=[];
  var spawns=[
    {type:'normal',x:2918},{type:'normal',x:3037},{type:'light',x:3143},
    {type:'light',x:4566},{type:'light',x:5189},{type:'normal',x:6058},
    {type:'normal',x:6065},{type:'light',x:6736},{type:'drone',x:6756},
    {type:'light',x:7166},{type:'normal',x:7300},{type:'light',x:7745},
    {type:'normal',x:8340},{type:'light',x:8429},{type:'light',x:11302},
    {type:'drone',x:12454},{type:'normal',x:12676},{type:'normal',x:12752},
    {type:'normal',x:12917},{type:'drone',x:13437},{type:'light',x:14016},
    {type:'normal',x:15321},{type:'light',x:16232},{type:'light',x:17593},
    {type:'light',x:17849},{type:'normal',x:18776},{type:'normal',x:19480},
    {type:'drone',x:19842},{type:'normal',x:20293},{type:'light',x:20644},
    {type:'normal',x:21845},{type:'light',x:22559},{type:'light',x:22623},
    {type:'normal',x:23153},{type:'armored',x:23865},{type:'drone',x:24088},
    {type:'normal',x:25099},{type:'normal',x:26031},{type:'normal',x:26172},
    {type:'armored',x:27145},{type:'light',x:28051},{type:'drone',x:28429},
    {type:'normal',x:29756},{type:'light',x:30948},{type:'normal',x:31226},
    {type:'normal',x:32565},{type:'drone',x:33762},{type:'normal',x:34572},
    {type:'drone',x:35361},{type:'normal',x:36040},{type:'light',x:36090},
    {type:'light',x:36275},{type:'normal',x:36907},{type:'drone',x:36968},
    {type:'armored',x:37129},{type:'normal',x:37906},{type:'drone',x:38021},
    {type:'normal',x:38293},{type:'armored',x:39001},{type:'light',x:39288},
    {type:'armored',x:39864},{type:'normal',x:40640},{type:'armored',x:41627},
    {type:'armored',x:41898},{type:'armored',x:42656},{type:'normal',x:43257},
    {type:'normal',x:44052},{type:'drone',x:44552},{type:'drone',x:45277},
    {type:'normal',x:45579},{type:'drone',x:45630},{type:'light',x:48555},
    {type:'normal',x:48624},{type:'armored',x:50581},{type:'normal',x:51391},
    {type:'normal',x:51849},{type:'light',x:52124},{type:'drone',x:54427},
    {type:'normal',x:55739},{type:'normal',x:56684},{type:'drone',x:57449},
    {type:'drone',x:57724},{type:'light',x:58347},{type:'normal',x:59146},
    {type:'armored',x:59481},{type:'drone',x:59925},{type:'armored',x:60310},
    {type:'armored',x:61049},{type:'light',x:62482},{type:'normal',x:63042},
    {type:'drone',x:64242},{type:'normal',x:64318},{type:'drone',x:64341},
    {type:'armored',x:67880},{type:'armored',x:69684},{type:'armored',x:69824},
    {type:'drone',x:70533},{type:'drone',x:70676},{type:'armored',x:70835},
    {type:'normal',x:71777},{type:'drone',x:72751},{type:'drone',x:73879},
    {type:'drone',x:74375},{type:'light',x:75517},{type:'light',x:75522},
    {type:'light',x:75842},{type:'normal',x:77303},{type:'drone',x:77577},
    {type:'armored',x:77854},{type:'drone',x:78752},{type:'armored',x:80638},
    {type:'normal',x:80948},{type:'normal',x:81308},{type:'drone',x:81624},
    {type:'armored',x:85173},{type:'drone',x:85714},{type:'normal',x:85734},
    {type:'normal',x:85991},{type:'drone',x:86058},{type:'drone',x:86083},
    {type:'drone',x:86229},{type:'armored',x:86952},{type:'armored',x:87342},
    {type:'armored',x:88547},{type:'drone',x:88695},{type:'armored',x:88862},
    {type:'normal',x:89918},{type:'armored',x:90070},{type:'drone',x:90604},
    {type:'armored',x:92067},{type:'normal',x:92397},{type:'drone',x:92437},
    {type:'drone',x:92586},{type:'armored',x:93407},{type:'armored',x:95326},
  ];

  for(var i=0;i<spawns.length;i++){
    var def=spawns[i],type=ENEMY_TYPES[def.type];
    var isDrone=type.flying||false;
    var flyY=isDrone?(GROUND_Y-type.flyY):0;
    ENEMIES.push({
      typeName:def.type,key:type.key,
      x:def.x,y:isDrone?flyY:GROUND_Y-type.h,
      vx:0,vy:0,w:type.w,h:type.h,
      onGround:!isDrone,flying:isDrone,flyY:isDrone?flyY:0,
      hp:type.hp,maxHp:type.hp,speed:type.speed,
      detectRange:type.detectRange,attackRange:type.attackRange,
      damage:type.damage,score:type.score,
      canShoot:type.canShoot,shootCool:0,maxShootCool:type.shootCool,
      state:STATE_PATROL,dir:1,spawnX:def.x,patrolDist:isDrone?200:120,
      flipDefault:type.flipDefault||false,
      inv:0,deadTimer:0,bobTick:Math.floor(Math.random()*30),bobY:0,
      jumpCool:0,
      // Spray pimenta (só armored)
      sprayCool:0,sprayActive:false,
      // Drone
      attackCount:0,attackTimer:0,fleeDir:1,fleeTimer:0,
    });
  }
}

// ============================================================
// NUVEM DE SPRAY DE PIMENTA
// ============================================================
function spawnPepperCloud(e){
  var cx = e.dir===1 ? e.x+e.w+10 : e.x-80;
  PEPPER_CLOUDS.push({
    x:cx, y:GROUND_Y-70,
    w:80, h:70,
    timer:180, // 3 segundos a 60fps
    alpha:0.7,
    hit:false,  // para não tirar vida várias vezes por frame
    hitCool:0,
  });
}

function updatePepperClouds(){
  for(var i=PEPPER_CLOUDS.length-1;i>=0;i--){
    var c=PEPPER_CLOUDS[i];
    c.timer--;
    // Expande e some gradualmente
    if(c.timer>120) c.alpha=0.7;
    else c.alpha=c.timer/120*0.7;
    c.w+=0.2; c.x-=0.1; // expande levemente

    // Dano ao player
    if(c.hitCool>0) c.hitCool--;
    if(!P.dead&&P.inv===0&&c.hitCool===0){
      if(P.x+P.w>c.x&&P.x<c.x+c.w&&P.y+P.h>c.y&&P.y<c.y+c.h){
        playerHit(false);
        c.hitCool=60; // 1 dano por segundo
      }
    }
    if(c.timer<=0) PEPPER_CLOUDS.splice(i,1);
  }
}

function drawPepperClouds(ctx){
  for(var i=0;i<PEPPER_CLOUDS.length;i++){
    var c=PEPPER_CLOUDS[i];
    var sx=Math.round(c.x-camX);
    ctx.save();
    ctx.globalAlpha=c.alpha;
    // Nuvem laranja/vermelha
    var grad=ctx.createRadialGradient(sx+c.w/2,Math.round(c.y)+c.h/2,5,sx+c.w/2,Math.round(c.y)+c.h/2,c.w/2);
    grad.addColorStop(0,'rgba(255,80,0,0.9)');
    grad.addColorStop(0.5,'rgba(255,150,0,0.6)');
    grad.addColorStop(1,'rgba(255,200,0,0)');
    ctx.fillStyle=grad;
    ctx.beginPath();
    ctx.ellipse(sx+c.w/2,Math.round(c.y)+c.h/2,c.w/2,c.h/2,0,0,Math.PI*2);
    ctx.fill();
    // Partículas
    ctx.fillStyle='rgba(255,100,0,0.4)';
    for(var p=0;p<5;p++){
      var px=sx+c.w*0.2+p*c.w*0.15;
      var py=Math.round(c.y)+c.h*0.3+Math.sin(Date.now()/200+p)*10;
      ctx.beginPath();ctx.arc(px,py,4,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
  }
}

// ============================================================
// ATUALIZA INIMIGOS
// ============================================================
function updateEnemies(){
  updatePepperClouds();

  for(var i=ENEMIES.length-1;i>=0;i--){
    var e=ENEMIES[i];
    if(e.state===STATE_DEAD){e.deadTimer++;if(e.deadTimer>40)ENEMIES.splice(i,1);continue;}
    if(e.x<camX-400||e.x>camX+1200) continue;
    if(e.inv>0) e.inv--;
    if(e.sprayCool>0) e.sprayCool--;

    var dx=P.x-e.x,dist=Math.abs(dx);
    var sameDir=(dx>0&&e.dir>0)||(dx<0&&e.dir<0);

    // DRONE
    if(e.flying){
      switch(e.state){
        case STATE_PATROL:
          e.vx=e.dir*e.speed;
          if(e.x<e.spawnX-e.patrolDist)e.dir=1;
          if(e.x>e.spawnX+e.patrolDist)e.dir=-1;
          e.bobTick++;e.y=e.flyY+Math.sin(e.bobTick*0.05)*15;
          if(dist<e.detectRange&&!P.dead){
            e.state=STATE_CHASE;
            e.attackCount=0; // reseta contador de tiros
          }
          break;
        case STATE_CHASE:
          e.dir=dx>0?1:-1;e.vx=e.dir*e.speed*1.5;
          e.bobTick++;e.y=e.flyY+Math.sin(e.bobTick*0.08)*10;
          if(dist>e.detectRange*1.5||P.dead){e.state=STATE_PATROL;e.vx=0;}
          if(dist<e.attackRange){
            e.state=STATE_ATTACK;
            e.vx=0;
            e.attackCount=0;
            e.attackTimer=120; // 2 segundos para atacar
          }
          break;
        case STATE_ATTACK:
          e.dir=dx>0?1:-1;
          e.bobTick++;e.y=e.flyY+Math.sin(e.bobTick*0.08)*8;
          e.attackTimer--;
          e.shootCool--;
          // Dispara até 2 tiros
          if(e.shootCool<=0&&e.attackCount<2){
            fireEnemyBullet(e);
            e.shootCool=30; // intervalo entre os 2 tiros
            e.attackCount++;
          }
          // Após 2 segundos ou 2 tiros — sai voando rápido
          if(e.attackTimer<=0||e.attackCount>=2){
            e.state=STATE_FLEE;
            e.fleeDir=e.dir*-1; // foge na direção oposta
            e.fleeTimer=120; // 2 segundos fugindo
          }
          break;
        case 'flee':
          e.dir=e.fleeDir;
          e.vx=e.dir*e.speed*3; // voa rápido
          e.y=Math.max(50,e.y-1); // sobe enquanto foge
          e.bobTick++;
          e.fleeTimer--;
          if(e.fleeTimer<=0){
            // Volta para patrulha
            e.state=STATE_PATROL;
            e.y=e.flyY;
            e.vx=0;
            e.spawnX=e.x; // nova posição de patrulha
          }
          break;
      }
      e.x+=e.vx;
      if(e.x<0)e.x=0;if(e.x>GW-e.w)e.x=GW-e.w;
      continue;
    }

    // TERRESTRES
    switch(e.state){
      case STATE_PATROL:
        e.vx=e.dir*e.speed;
        if(e.x<e.spawnX-e.patrolDist)e.dir=1;
        if(e.x>e.spawnX+e.patrolDist)e.dir=-1;
        if(dist<e.detectRange&&sameDir&&!P.dead)e.state=STATE_CHASE;
        e.bobTick++;e.bobY=Math.sin(e.bobTick*0.15)*2;
        break;
      case STATE_CHASE:
        e.dir=dx>0?1:-1;e.vx=e.dir*e.speed*1.3;
        e.bobTick++;e.bobY=Math.sin(e.bobTick*0.25)*3;
        if(e.typeName==='light'&&dist<180&&e.onGround){
          if(!e.jumpCool||e.jumpCool<=0){e.vy=-10;e.jumpCool=90;}
        }
        if(e.jumpCool>0)e.jumpCool--;
        if(dist>e.detectRange*1.5||P.dead){e.state=STATE_PATROL;e.vx=0;}
        if(dist<e.attackRange){e.state=STATE_ATTACK;e.vx=0;}
        break;
      case STATE_ATTACK:
        e.vx=0;e.dir=dx>0?1:-1;e.bobY=0;
        if(e.typeName==='armored'){
          // Spray de pimenta a distância média (40-120px)
          if(dist>40&&dist<120&&e.sprayCool===0&&e.onGround){
            spawnPepperCloud(e);
            e.sprayCool=300; // 5 segundos entre sprays
          }
          // Corpo a corpo quando muito perto
          if(dist<40&&!P.dead)playerHit(false);
          if(dist>e.attackRange*1.5)e.state=STATE_CHASE;
        } else if(e.canShoot){
          e.shootCool--;
          if(e.shootCool<=0){fireEnemyBullet(e);e.shootCool=e.maxShootCool;}
          if(dist>e.attackRange*1.2)e.state=STATE_CHASE;
        } else {
          if(dist<e.attackRange&&!P.dead)playerHit(false);
          if(dist>e.attackRange*1.5)e.state=STATE_CHASE;
        }
        if(dist>e.detectRange*1.5||P.dead)e.state=STATE_PATROL;
        break;
    }

    e.vy+=0.6;if(e.vy>14)e.vy=14;
    e.x+=e.vx;e.y+=e.vy;
    if(e.x<0)e.x=0;if(e.x>GW-e.w)e.x=GW-e.w;
    e.onGround=false;
    if(e.vy>=0&&e.y+e.h>=GROUND_Y){e.y=GROUND_Y-e.h;e.vy=0;e.onGround=true;}
    if(e.vy>=0){
      for(var j=0;j<PLATFORMS.length;j++){
        var pl=PLATFORMS[j];
        if(Math.abs(pl.x-e.x)>500)continue;
        var prev=e.y+e.h-e.vy;
        if(e.x+e.w-4>pl.x&&e.x+4<pl.x+pl.w&&prev<=pl.y&&e.y+e.h>=pl.y){
          e.y=pl.y-e.h;e.vy=0;e.onGround=true;
        }
      }
    }
  }
  updateEnemyBullets();
}

function fireEnemyBullet(e){
  if(e.flying){
    // Drone — atira em direção à posição atual do Gabriel (ângulo)
    var tx = P.x + P.w/2;
    var ty = P.y + P.h/2;
    var bx = e.x + e.w/2;
    var by = e.y + e.h/2;
    var dx = tx - bx;
    var dy = ty - by;
    var dist = Math.sqrt(dx*dx + dy*dy);
    var speed = 6;
    ENEMY_BULLETS.push({
      x:bx, y:by,
      vx:(dx/dist)*speed,
      vy:(dy/dist)*speed,
      w:10, h:10, active:true,
      fromDrone:true, // marca como bala de drone
    });
  } else {
    // Terrestres — atira na altura do peito (passa por cima quando agachado)
    ENEMY_BULLETS.push({
      x:e.dir===1?e.x+e.w:e.x-10,
      y:e.y+e.h*0.35, // altura do peito
      vx:e.dir*5, vy:0,
      w:10, h:5, active:true,
      fromDrone:false,
    });
  }
}

function updateEnemyBullets(){
  for(var i=ENEMY_BULLETS.length-1;i>=0;i--){
    var b=ENEMY_BULLETS[i];
    if(!b.active){ENEMY_BULLETS.splice(i,1);continue;}
    b.x+=b.vx;
    b.y+=b.vy||0; // suporte a vy para balas do drone
    if(b.x<camX-50||b.x>camX+850){ENEMY_BULLETS.splice(i,1);continue;}
    if(b.y>GROUND_Y+20){ENEMY_BULLETS.splice(i,1);continue;} // caiu no chão

    if(!P.dead&&P.inv===0){
      // Hitbox do Gabriel — menor quando agachado
      var pH  = P.crouching ? Math.round(P.h*0.55) : P.h;
      var pY  = P.y + (P.h - pH); // alinha os pés

      // Balas terrestres NÃO acertam Gabriel agachado
      // (passam por cima pois são disparadas na altura do peito do inimigo)
      if(!b.fromDrone && P.crouching){
        // Bala passa acima — não colide
        continue;
      }

      if(b.x+b.w>P.x && b.x<P.x+P.w &&
         b.y+b.h>pY   && b.y<pY+pH){
        playerHit(false);
        ENEMY_BULLETS.splice(i,1);
      }
    }
  }
}

function hitEnemy(e){
  if(e.inv>0||e.state===STATE_DEAD)return;
  e.hp--;e.inv=20;
  if(e.hp<=0){e.state=STATE_DEAD;e.deadTimer=0;e.vx=0;P.score+=e.score;}
  else e.state=STATE_CHASE;
}

function drawEnemies(ctx){
  // Spray de pimenta primeiro (atrás dos personagens)
  drawPepperClouds(ctx);

  for(var i=0;i<ENEMIES.length;i++){
    var e=ENEMIES[i],sx=Math.round(e.x-camX);
    if(sx+e.w<-10||sx>810)continue;
    if(e.inv>0&&Math.floor(e.inv/4)%2===0)continue;
    if(e.state===STATE_DEAD)ctx.globalAlpha=1-(e.deadTimer/40);

    if(e.flying){drawDrone(ctx,e,sx);ctx.globalAlpha=1;continue;}

    var img=IMGS[e.key];
    if(img){
      var dH=e.h,dW=Math.round(img.width*(dH/img.height));
      var bX=sx+Math.round((e.w-dW)/2),bY=Math.round(e.y+e.bobY)+(e.h-dH);
      var flip=e.flipDefault?(e.dir>0):(e.dir<0);
      ctx.save();
      if(flip){ctx.translate(bX+dW,bY);ctx.scale(-1,1);ctx.drawImage(img,0,0,dW,dH);}
      else ctx.drawImage(img,bX,bY,dW,dH);
      ctx.restore();
    } else {
      ctx.fillStyle={light:'#ff6644',normal:'#ff4444',armored:'#884444'}[e.typeName]||'#ff4444';
      ctx.fillRect(sx,Math.round(e.y),e.w,e.h);
    }
    ctx.globalAlpha=1;
    if(e.typeName!=='light'&&e.state!==STATE_DEAD){
      var bw=e.w,bh=4,by=Math.round(e.y)-8,pct=e.hp/e.maxHp;
      ctx.fillStyle='rgba(0,0,0,0.6)';ctx.fillRect(sx,by,bw,bh);
      ctx.fillStyle=pct>0.5?'#00cc44':pct>0.25?'#ffaa00':'#ff3300';
      ctx.fillRect(sx,by,Math.round(bw*pct),bh);
    }
  }

  // Balas
  for(var i=0;i<ENEMY_BULLETS.length;i++){
    var b=ENEMY_BULLETS[i],bx=Math.round(b.x-camX);
    if(b.fromDrone){
      // Bala do drone — azul elétrica
      ctx.fillStyle='#00AAFF';
      ctx.beginPath();ctx.arc(bx+5,Math.round(b.y)+5,5,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='rgba(0,170,255,0.3)';
      ctx.beginPath();ctx.arc(bx+5,Math.round(b.y)+5,9,0,Math.PI*2);ctx.fill();
    } else {
      // Bala terrestre — laranja
      ctx.fillStyle='#ff6600';ctx.fillRect(bx,Math.round(b.y),b.w,b.h);
      ctx.fillStyle='rgba(255,100,0,0.3)';ctx.fillRect(bx-2,Math.round(b.y)-2,b.w+4,b.h+4);
    }
  }
}

function drawDrone(ctx,e,sx){
  var img=IMGS['drone'];
  var y=Math.round(e.y);
  var w=e.w,h=e.h;

  // Sombra no chão
  ctx.fillStyle='rgba(0,0,0,0.2)';
  ctx.beginPath();
  ctx.ellipse(sx+w/2,GROUND_Y-4,w*0.35,5,0,0,Math.PI*2);
  ctx.fill();

  if(img){
    // Usa imagem real do drone
    var flip=e.dir<0;
    ctx.save();
    if(flip){ctx.translate(sx+w,y);ctx.scale(-1,1);ctx.drawImage(img,0,0,w,h);}
    else ctx.drawImage(img,sx,y,w,h);
    ctx.restore();
  } else {
    // Fallback geométrico
    var pulse=(Math.floor(Date.now()/200)%2===0);
    ctx.fillStyle=e.state===STATE_ATTACK?'#FF4444':'#334455';
    ctx.fillRect(sx+w*0.2,y+h*0.2,w*0.6,h*0.6);
    ctx.fillStyle=pulse?'#FF0000':'#880000';
    ctx.beginPath();ctx.arc(sx+w/2,y+h*0.45,5,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='rgba(100,200,255,0.6)';
    var spin=Math.floor(Date.now()/60)%2;
    ctx.fillRect(sx+(spin?4:0),y+h*0.1,w*0.4,3);
    ctx.fillRect(sx+w*0.55+(spin?0:4),y+h*0.1,w*0.4,3);
  }

  // Linha de fio
  ctx.strokeStyle='rgba(100,200,255,0.15)';
  ctx.lineWidth=1;ctx.setLineDash([3,5]);
  ctx.beginPath();ctx.moveTo(sx+w/2,y+h);ctx.lineTo(sx+w/2,GROUND_Y);
  ctx.stroke();ctx.setLineDash([]);

  // Barra HP
  if(e.state!==STATE_DEAD){
    var pct=e.hp/e.maxHp;
    ctx.fillStyle='rgba(0,0,0,0.6)';ctx.fillRect(sx,y-8,w,4);
    ctx.fillStyle=pct>0.5?'#00cc44':pct>0.25?'#ffaa00':'#ff3300';
    ctx.fillRect(sx,y-8,Math.round(w*pct),4);
  }
}
