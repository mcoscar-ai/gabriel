<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
</head>
<body style="background:#000;margin:0">
<canvas id="c"></canvas>
<script src="js/assets.js"></script>
<script src="js/input.js"></script>
<script src="js/player.js"></script>
<script>
  var C = document.getElementById('c');
  var X = C.getContext('2d');
  var W = 800, H = 400;
  C.width = W; C.height = H;
  C.style.width = W+'px'; C.style.height = H+'px';

  loadAllAssets().then(function(){
    function loop(){
      requestAnimationFrame(loop);
      X.fillStyle = '#111';
      X.fillRect(0, 0, W, H);
      // Chão
      X.fillStyle = '#333';
      X.fillRect(0, GROUND_Y, W, H - GROUND_Y);
      // Plataformas
      PLATFORMS.forEach(function(pl){
        X.fillStyle = '#555';
        X.fillRect(pl.x - camX, pl.y, pl.w, pl.h);
      });
      updatePlayer();
      drawPlayer(X, W, H);
      drawBullets(X);
      // HUD simples
      X.fillStyle = '#fff';
      X.font = '14px monospace';
      X.fillText('Vidas: ' + P.lives + '  Score: ' + P.score, 10, 20);
    }
    loop();
  });
</script>
</body>
</html>
