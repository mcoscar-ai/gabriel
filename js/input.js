// ============================================================
// input.js — Controles PC (teclado) e Mobile (cruz SNES)
// ============================================================

var INPUT = {
  left:        false,
  right:       false,
  down:        false,
  fire:        false,
  jumpPressed: false,
  _jumpHeld:   false,
};

var IS_MOBILE = ('ontouchstart' in window) ||
                navigator.maxTouchPoints > 0 ||
                window.matchMedia('(pointer:coarse)').matches;

var KEYS = {};

// ============================================================
// TECLADO — PC
// ============================================================
window.addEventListener('keydown', function(e){
  KEYS[e.code] = true;
  if((e.code === 'ArrowUp' || e.code === 'Space') && !INPUT._jumpHeld){
    INPUT.jumpPressed = true;
    INPUT._jumpHeld   = true;
  }
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].indexOf(e.code) !== -1){
    e.preventDefault();
  }
});

window.addEventListener('keyup', function(e){
  KEYS[e.code] = false;
  if(e.code === 'ArrowUp' || e.code === 'Space'){
    INPUT._jumpHeld = false;
  }
});

INPUT._updateKeyboard = function(){
  INPUT.left  = !!(KEYS['ArrowLeft']  || KEYS['KeyA']);
  INPUT.right = !!(KEYS['ArrowRight'] || KEYS['KeyD']);
  INPUT.down  = !!(KEYS['ArrowDown']  || KEYS['KeyS']);
  INPUT.fire  = !!(KEYS['KeyX']       || KEYS['KeyZ']);
};

// ============================================================
// MOBILE — Cruz direcional estilo SNES
// ============================================================
if(IS_MOBILE){

  // Injeta estilo base dos botões
  var style = document.createElement('style');
  style.textContent =
    '.gbtn{' +
      'position:fixed;' +
      'background:rgba(255,255,255,0.08);' +
      'border:2px solid rgba(255,255,255,0.25);' +
      'border-radius:8px;' +
      'display:flex;align-items:center;justify-content:center;' +
      'color:rgba(255,255,255,0.6);' +
      'user-select:none;-webkit-user-select:none;' +
      'z-index:1000;touch-action:none;' +
      'transition:background 0.05s;' +
    '}' +
    '.gbtn.active{' +
      'background:rgba(255,255,100,0.4);' +
      'border-color:rgba(255,255,100,0.9);' +
    '}' +
    '#btn-fire{border-radius:50%!important;background:rgba(220,50,50,0.15)!important;border-color:rgba(255,80,80,0.4)!important;}' +
    '#btn-fire.active{background:rgba(255,80,80,0.55)!important;border-color:rgba(255,130,130,0.9)!important;}';
  document.head.appendChild(style);

  function createBtn(id, label){
    var el = document.createElement('div');
    el.id  = id;
    el.className = 'gbtn';
    el.setAttribute('data-btn', id);
    el.textContent = label;
    document.body.appendChild(el);
    return el;
  }

  createBtn('btn-up',    '▲');
  createBtn('btn-down',  '▼');
  createBtn('btn-left',  '◄');
  createBtn('btn-right', '►');
  createBtn('btn-fire',  '●');

  // Reposiciona botões baseado no tamanho ATUAL da tela
  // Chamado na inicialização E a cada resize/rotação
  function layoutBtns(){
    var W = window.innerWidth;
    var H = window.innerHeight;
    var S = Math.min(W, H) * 0.14; // tamanho do botão = 14% do menor lado
    var M = S * 0.18;              // margem
    var F = S * 1.15;              // botão de fogo maior

    // Centro da cruz — canto inferior esquerdo
    var CX = M + S;
    var CY = H - M - S;

    function pos(id, x, y, w, h){
      var el = document.getElementById(id);
      if(!el) return;
      el.style.left   = x + 'px';
      el.style.top    = y + 'px';
      el.style.width  = w + 'px';
      el.style.height = h + 'px';
      el.style.fontSize = (w * 0.42) + 'px';
    }

    // Cruz direcional
    pos('btn-up',    CX - S/2,        CY - S*1.1,   S, S);
    pos('btn-down',  CX - S/2,        CY + S*0.1,   S, S);
    pos('btn-left',  CX - S*1.6,      CY - S/2,     S, S);
    pos('btn-right', CX + S*0.6,      CY - S/2,     S, S);

    // Botão fogo — canto inferior direito
    pos('btn-fire',  W - M - F,  H - M - F,  F, F);
  }

  // Posiciona na inicialização
  layoutBtns();

  // Reposiciona em qualquer mudança de tamanho ou rotação
  window.addEventListener('resize',            layoutBtns);
  window.addEventListener('orientationchange', function(){
    // Aguarda 200ms para o browser terminar a rotação antes de recalcular
    setTimeout(layoutBtns, 200);
  });

  // ---- Touch handlers ----
  function setActive(id, on){
    var el = document.getElementById(id);
    if(!el) return;
    if(on) el.classList.add('active');
    else   el.classList.remove('active');
  }

  var BTN_MAP = {
    'btn-left':  'left',
    'btn-right': 'right',
    'btn-down':  'down',
    'btn-fire':  'fire',
  };

  var activeTouches = {};

  function getBtnAt(x, y){
    var el = document.elementFromPoint(x, y);
    if(!el) return null;
    return el.getAttribute('data-btn') || null;
  }

  function pressBtn(id){
    if(!id) return;
    if(id === 'btn-up'){
      if(!INPUT._jumpHeld){
        INPUT.jumpPressed = true;
        INPUT._jumpHeld   = true;
      }
      setActive('btn-up', true);
      return;
    }
    var field = BTN_MAP[id];
    if(field) INPUT[field] = true;
    setActive(id, true);
  }

  function releaseBtn(id){
    if(!id) return;
    if(id === 'btn-up'){
      INPUT._jumpHeld = false;
      setActive('btn-up', false);
      return;
    }
    var field = BTN_MAP[id];
    if(field) INPUT[field] = false;
    setActive(id, false);
  }

  document.addEventListener('touchstart', function(e){
    e.preventDefault();
    for(var i = 0; i < e.changedTouches.length; i++){
      var t   = e.changedTouches[i];
      var btn = getBtnAt(t.clientX, t.clientY);
      activeTouches[t.identifier] = btn;
      pressBtn(btn);
    }
  }, { passive: false });

  document.addEventListener('touchmove', function(e){
    e.preventDefault();
    for(var i = 0; i < e.changedTouches.length; i++){
      var t      = e.changedTouches[i];
      var oldBtn = activeTouches[t.identifier];
      var newBtn = getBtnAt(t.clientX, t.clientY);
      if(oldBtn !== newBtn){
        releaseBtn(oldBtn);
        activeTouches[t.identifier] = newBtn;
        pressBtn(newBtn);
      }
    }
  }, { passive: false });

  document.addEventListener('touchend', function(e){
    e.preventDefault();
    for(var i = 0; i < e.changedTouches.length; i++){
      var t = e.changedTouches[i];
      releaseBtn(activeTouches[t.identifier]);
      delete activeTouches[t.identifier];
    }
  }, { passive: false });

  document.addEventListener('touchcancel', function(e){
    for(var id in activeTouches) releaseBtn(activeTouches[id]);
    activeTouches   = {};
    INPUT._jumpHeld = false;
  }, { passive: false });

  INPUT._updateKeyboard = function(){};
}

INPUT.clearJump = function(){
  INPUT.jumpPressed = false;
};
