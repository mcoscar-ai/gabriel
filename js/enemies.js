// enemies.js — 64 inimigos espalhados em 96000px
var STATE_PATROL='patrol',STATE_CHASE='chase',STATE_ATTACK='attack',STATE_DEAD='dead';
var ENEMIES=[],ENEMY_BULLETS=[];

var ENEMY_TYPES={
  light:  {key:'guard_light',  hp:2,speed:2.8,detectRange:220,attackRange:50, damage:1,score:100, canShoot:false,shootCool:0,  w:40,h:110,flipDefault:false},
  normal: {key:'guard_normal', hp:6,speed:1.8,detectRange:280,attackRange:200,damage:1,score:200, canShoot:true, shootCool:90, w:44,h:115,flipDefault:false},
  armored:{key:'guard_armored',hp:8,speed:1.0,detectRange:180,attackRange:40, damage:2,score:400, canShoot:false,shootCool:0,  w:50,h:120,flipDefault:false},
};

function spawnEnemies(){
  ENEMIES=[];
  var spawns=[
    {type:'normal',x:800},{type:'normal',x:2025},{type:'light',x:3475},
    {type:'normal',x:4779},{type:'light',x:6537},{type:'light',x:8169},
    {type:'light',x:9464},{type:'normal',x:11181},{type:'light',x:12955},
    {type:'light',x:14713},{type:'normal',x:16372},{type:'normal',x:17578},
    {type:'normal',x:18941},{type:'light',x:20489},{type:'armored',x:21909},
    {type:'light',x:23453},{type:'light',x:25042},{type:'normal',x:26594},
    {type:'normal',x:27838},{type:'light',x:29587},{type:'light',x:31174},
    {type:'armored',x:32674},{type:'normal',x:34244},{type:'light',x:35515},
    {type:'armored',x:36948},{type:'armored',x:38229},{type:'normal',x:39532},
    {type:'normal',x:41196},{type:'light',x:42769},{type:'light',x:44332},
    {type:'armored',x:45805},{type:'normal',x:47078},{type:'normal',x:48453},
    {type:'light',x:49903},{type:'light',x:51491},{type:'light',x:53261},
    {type:'armored',x:54793},{type:'light',x:56050},{type:'armored',x:57282},
    {type:'light',x:58892},{type:'armored',x:60308},{type:'armored',x:62088},
    {type:'light',x:63610},{type:'normal',x:65321},{type:'light',x:66990},
    {type:'normal',x:68332},{type:'normal',x:70106},{type:'normal',x:71904},
    {type:'normal',x:73701},{type:'armored',x:75125},{type:'normal',x:76466},
    {type:'armored',x:77759},{type:'light',x:79071},{type:'armored',x:80434},
    {type:'normal',x:82066},{type:'normal',x:83660},{type:'normal',x:85339},
    {type:'armored',x:87105},{type:'armored',x:88316},{type:'armored',x:89633},
    {type:'armored',x:91382},{type:'light',x:92930},{type:'light',x:94575},
    {type:'armored',x:95778},
  ];
  for(var i=0;i<spawns.length;i++){
    var def=spawns[i],type=ENEMY_TYPES[def.type];
    ENEMIES.push({
      typeName:def.type,key:type.key,
      x:def.x,y:GROUND_Y-type.h,vx:0,vy:0,w:type.w,h:type.h,onGround:false,
      hp:type.hp,maxHp:type.hp,speed:type.speed,
      detectRange:type.detectRange,attackRange:type.attackRange,
      damage:type.damage,score:type.score,
      canShoot:type.canShoot,shootCool:0,maxShootCool:type.shootCool,
      state:STATE_PATROL,dir:1,spawnX:def.x,patrolDist:150,
      inv:0,deadTimer:0,bobTick:Math.floor(Math.random()*30),bobY:0,
      flipDefault:type.flipDefault||false,jumpCool:0,
    });
  }
}

function updateEnemies(){
  for(var i=ENEMIES.length-1;i>=0;i--){
    var e=ENEMIES[i];
    if(e.state===STATE_DEAD){e.deadTimer++;if(e.deadTimer>40)ENEMIES.splice(i,1);continue;}
    if(e.x<camX-400||e.x>camX+1200) continue;
    if(e.inv>0) e.inv--;
    var dx=P.x-e.x,dist=Math.abs(dx);
    var sameDir=(dx>0&&e.dir>0)||(dx<0&&e.dir<0);
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
        if(e.canShoot){
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
        if(Math.abs(pl.x-e.x)>500) continue;
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
  ENEMY_BULLETS.push({x:e.dir===1?e.x+e.w:e.x-10,y:e.y+e.h*0.4,vx:e.dir*5,w:10,h:5,active:true});
}

function updateEnemyBullets(){
  for(var i=ENEMY_BULLETS.length-1;i>=0;i--){
    var b=ENEMY_BULLETS[i];
    if(!b.active){ENEMY_BULLETS.splice(i,1);continue;}
    b.x+=b.vx;
    if(b.x<camX-50||b.x>camX+850){ENEMY_BULLETS.splice(i,1);continue;}
    if(!P.dead&&P.inv===0){
      if(b.x+b.w>P.x&&b.x<P.x+P.w&&b.y+b.h>P.y&&b.y<P.y+P.h){
        playerHit(false);ENEMY_BULLETS.splice(i,1);
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
  for(var i=0;i<ENEMIES.length;i++){
    var e=ENEMIES[i],sx=Math.round(e.x-camX);
    if(sx+e.w<-10||sx>810)continue;
    if(e.inv>0&&Math.floor(e.inv/4)%2===0)continue;
    var img=IMGS[e.key];
    if(e.state===STATE_DEAD)ctx.globalAlpha=1-(e.deadTimer/40);
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
  for(var i=0;i<ENEMY_BULLETS.length;i++){
    var b=ENEMY_BULLETS[i],bx=Math.round(b.x-camX);
    ctx.fillStyle='#ff6600';ctx.fillRect(bx,Math.round(b.y),b.w,b.h);
    ctx.fillStyle='rgba(255,100,0,0.3)';ctx.fillRect(bx-2,Math.round(b.y)-2,b.w+4,b.h+4);
  }
}
