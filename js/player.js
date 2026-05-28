// player.js — Gabriel: movimento, física, animação, tiro
var GROUND_Y  = 338;
var GW        = 96000; // 3 zonas de 32000px cada
var GAB_H     = 110;
var GAB_W     = 40;
var camX      = 0;

var PLATFORMS = [];

// Gera plataformas automaticamente a cada 350px pelo mundo todo
(function(){
  var configs = [
    {dy:-90, w:160}, {dy:-140, w:130}, {dy:-100, w:170},
    {dy:-150, w:140}, {dy:-110, w:160}, {dy:-160, w:130},
    {dy:-120, w:170}, {dy:-150, w:140}, {dy:-110, w:160},
    {dy:-140, w:130},
  ];
  var ci = 0;
  for(var x = 650; x < GW - 500; x += 350){
    var c = configs[ci % configs.length];
    PLATFORMS.push({x:x, y:GROUND_Y+c.dy, w:c.w, h:16});
    ci++;
  }
})();

var P = {
  x:150, y:GROUND_Y-GAB_H,
  vx:0, vy:0,
  w:GAB_W, h:GAB_H,
  dir:1, onGround:false, jCount:0,
  crouching:false, lives:15, inv:0,
  score:0, dead:false,
  animFrame:0, runTick:0, runToggle:0,
  fireCool:0,
};

var BULLETS = [];

function updatePlayer(){
  if(P.dead) return;
  INPUT._updateKeyboard();
  if(INPUT.updateGamepad) INPUT.updateGamepad();

  var moving = false;
  if(INPUT.left){  P.vx=-5; P.dir=-1; moving=true; }
  else if(INPUT.right){ P.vx=5; P.dir=1; moving=true; }
  else { P.vx*=0.75; if(Math.abs(P.vx)<0.1) P.vx=0; }

  P.crouching = (INPUT.down && P.onGround);
  if(P.crouching){ P.vx=0; moving=false; }

  if(INPUT.jumpPressed){
    INPUT.clearJump();
    if(P.jCount < 2){
      P.vy = (P.jCount===0) ? -12 : -9;
      P.jCount++;
      P.onGround=false;
      P.crouching=false;
    }
  }

  if(!P.onGround){ P.vy+=0.6; if(P.vy>14) P.vy=14; }

  P.x+=P.vx; P.y+=P.vy;

  if(P.x<0) P.x=0;
  if(P.x>GW-P.w) P.x=GW-P.w;
  if(P.y>600){ playerHit(true); return; }

  P.onGround=false;
  if(P.vy>=0 && P.y+P.h>=GROUND_Y){
    P.y=GROUND_Y-P.h; P.vy=0; P.onGround=true; P.jCount=0;
  }

  if(P.vy>=0){
    for(var i=0;i<PLATFORMS.length;i++){
      var pl=PLATFORMS[i];
      if(Math.abs(pl.x - P.x) > 500) continue; // culling
      var prev=P.y+P.h-P.vy;
      if(P.x+P.w-4>pl.x && P.x+4<pl.x+pl.w && prev<=pl.y && P.y+P.h>=pl.y){
        P.y=pl.y-P.h; P.vy=0; P.onGround=true; P.jCount=0;
      }
    }
  }

  var tc=P.x-250;
  camX+=(tc-camX)*0.1;
  camX=Math.max(0,Math.min(GW-800,camX));

  if(P.inv>0) P.inv--;
  if(P.fireCool>0) P.fireCool--;

  if(INPUT.fire && P.fireCool===0 && !P.crouching){
    fireBullet(); P.fireCool=25;
  }

  if(P.crouching && P.onGround){ P.animFrame=4; }
  else if(!P.onGround){ P.animFrame=3; }
  else if(moving){
    P.runTick++;
    if(P.runTick>=8){ P.runTick=0; P.runToggle=1-P.runToggle; }
    P.animFrame=P.runToggle?2:1;
  } else { P.animFrame=0; P.runTick=0; P.runToggle=0; }

  updateBullets();
}

function fireBullet(){
  BULLETS.push({
    x: P.dir===1 ? P.x+P.w : P.x-12,
    y: P.y+P.h*0.35,
    vx: P.dir*9, w:12, h:6, active:true,
  });
}

function updateBullets(){
  for(var i=BULLETS.length-1;i>=0;i--){
    var b=BULLETS[i];
    if(!b.active){ BULLETS.splice(i,1); continue; }
    b.x+=b.vx;
    if(b.x<camX-50||b.x>camX+850) BULLETS.splice(i,1);
  }
}

function playerHit(instant){
  if(P.inv>0 && !instant) return;
  P.lives--;
  if(P.lives<=0){ P.lives=0; P.dead=true; }
  else {
    P.inv=120;
    if(instant){ P.x=150; P.y=GROUND_Y-P.h; P.vx=0; P.vy=0; }
  }
}

function drawPlayer(ctx){
  if(P.dead) return;
  if(P.inv>0 && Math.floor(P.inv/6)%2===0) return;
  var px=Math.round(P.x-camX);
  var sprMap={0:'idle',1:'run1',2:'run2',3:'jump',4:'crouch'};
  var img=IMGS[sprMap[P.animFrame]];
  if(!img) return;
  var dH=(P.animFrame===4)?Math.round(GAB_H*0.7):GAB_H;
  var dW=Math.round(img.width*(dH/img.height));
  var bY=Math.round(P.y)+(P.h-dH);
  var bX=px+Math.round((P.w-dW)/2);
  ctx.save();
  if(P.dir<0){ ctx.translate(bX+dW,bY); ctx.scale(-1,1); ctx.drawImage(img,0,0,dW,dH); }
  else { ctx.drawImage(img,bX,bY,dW,dH); }
  ctx.restore();
}

function drawBullets(ctx){
  var img=IMGS['ammo'];
  for(var i=0;i<BULLETS.length;i++){
    var b=BULLETS[i];
    var bx=Math.round(b.x-camX);
    if(img){ ctx.drawImage(img,bx,Math.round(b.y),b.w*2,b.h*2); }
    else { ctx.fillStyle='#FFD700'; ctx.fillRect(bx,Math.round(b.y),b.w,b.h); }
  }
}
