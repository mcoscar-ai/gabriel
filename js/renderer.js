// renderer.js — Backgrounds, chão, plataformas
var BG_W = 1774;

function getZone(){
  if(camX < GW * 0.33) return 1;  // 0 - 32000
  if(camX < GW * 0.66) return 2;  // 32000 - 64000
  return 3;                         // 64000 - 96000
}

function getZoneName(){
  var z=getZone();
  if(z===1) return 'ZONA 1 — Beto Carrero';
  if(z===2) return 'ZONA 2 — Laboratório';
  return 'ZONA 3 — Datacenter NEXCORP';
}

function getZoneBg(){
  var z=getZone();
  if(z===1) return IMGS['bg1'];
  if(z===2) return IMGS['bg2'];
  return IMGS['bg3'];
}

function drawBg(ctx,W,H){
  var bg=getZoneBg();
  if(!bg){
    var z=getZone();
    ctx.fillStyle=z===1?'#0a0a1a':z===2?'#0a1a0a':'#1a0a0a';
    ctx.fillRect(0,0,W,H); return;
  }
  ctx.imageSmoothingEnabled=true;
  ctx.imageSmoothingQuality='high';
  var scale=H/bg.height;
  var drawW=Math.round(bg.width*scale);
  var offset=-(camX*0.3)%drawW;
  if(offset>0) offset-=drawW;
  var x=Math.round(offset);
  while(x<W){ ctx.drawImage(bg,x,0,drawW,H); x+=drawW; }
  ctx.fillStyle='rgba(0,0,10,0.2)';
  ctx.fillRect(0,0,W,H);
}

var _lastZone=1, _zoneFade=0;
function drawZoneTransition(ctx,W,H){
  var z=getZone();
  if(z!==_lastZone){_lastZone=z;_zoneFade=30;}
  if(_zoneFade>0){
    ctx.fillStyle='rgba(0,0,0,'+(_zoneFade/30*0.6)+')';
    ctx.fillRect(0,0,W,H); _zoneFade--;
  }
}

function drawGround(ctx,W,H){
  ctx.fillStyle='#0d0d14'; ctx.fillRect(0,GROUND_Y,W,H-GROUND_Y);
  var z=getZone();
  var lc=z===1?'rgba(0,255,136,0.8)':z===2?'rgba(0,200,255,0.8)':'rgba(255,80,80,0.8)';
  ctx.fillStyle=lc; ctx.fillRect(0,GROUND_Y,W,2);
  ctx.fillStyle=lc.replace('0.8','0.15'); ctx.fillRect(0,GROUND_Y+2,W,6);
  ctx.strokeStyle='rgba(255,255,255,0.03)'; ctx.lineWidth=1;
  for(var y=GROUND_Y+16;y<H;y+=18){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
  var vOff=-(camX%55);
  for(var x=vOff;x<W+55;x+=55){ctx.beginPath();ctx.moveTo(Math.round(x),GROUND_Y+2);ctx.lineTo(Math.round(x),H);ctx.stroke();}
}

function drawPlatforms(ctx){
  var z=getZone();
  var nc=z===1?'rgba(0,255,136,':z===2?'rgba(0,200,255,':'rgba(255,80,80,';
  for(var i=0;i<PLATFORMS.length;i++){
    var pl=PLATFORMS[i];
    var sx=Math.round(pl.x-camX);
    if(sx+pl.w<-10||sx>810) continue;
    ctx.fillStyle='rgba(0,0,0,0.4)'; ctx.fillRect(sx+4,pl.y+6,pl.w,pl.h);
    ctx.fillStyle='#1a1a28'; ctx.fillRect(sx,pl.y,pl.w,pl.h);
    ctx.fillStyle='#262636'; ctx.fillRect(sx,pl.y,pl.w,5);
    ctx.fillStyle=nc+'0.7)'; ctx.fillRect(sx,pl.y+pl.h-2,pl.w,2);
    ctx.fillStyle=nc+'0.12)'; ctx.fillRect(sx,pl.y+pl.h,pl.w,4);
  }
}

function renderScene(ctx,W,H){
  drawBg(ctx,W,H);
  drawZoneTransition(ctx,W,H);
  drawGround(ctx,W,H);
  drawPlatforms(ctx);
}
