// ============================================================
// input.js — Controles PC (teclado) e Mobile
// Esquerda: ◄  ►  e ▼ embaixo entre eles
// Direita: ▲ PULO (cima) + ● FOGO (baixo)
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
// MOBILE
// ============================================================
if(IS_MOBILE){

  var style = document.createElement('style');
  style.textContent =
    '.gbtn{' +
      'position:fixed;' +
      'background:rgba(0,0,0,0.35);' +
      'border:2px solid rgba(255,255,255,0.3);' +
      'border-radius:10px;' +
      'display:flex;align-items:center;justify-content:center;' +
      'color:rgba(255,255,255,0.7);font-weight:bold;' +
      'user-select:none;-webkit-user-select:none;' +
      'z-index:1000;touch-action:none;' +
      'transition:background 0.05s, border-color 0.05s;' +
    '}' +
    '.gbtn.active{' +
      'background:rgba(255,220,0,0.45);' +
      'border-color:rgba(255,220,0,0.95);' +
      'color:#fff;' +
    '}' +
    '#btn-fire{' +
      'border-radius:50%!important;' +
      'background:rgba(180,0,0,0.35)!important;' +
      'border-color:rgba(255,60,60,0.5)!important;' +
    '}' +
    '#btn-fire.active{' +
      'background:rgba(255,50,50,0.6)!important;' +
      'border-color:rgba(255,120,120,0.95)!important;' +
    '}' +
    '#btn-jump{' +
      'border-radius:50%!important;' +
      'background:rgba(0,80,180,0.35)!important;' +
      'border-color:rgba(60,160,255,0.5)!important;' +
    '}' +
    '#btn-jump.active{' +
      'background:rgba(50,150,255,0.6)!important;' +
      'border-color:rgba(120,200,255,0.95)!important;' +
    '}';
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

  createBtn('btn-left',  '◄');
  createBtn('btn-right', '►');
  createBtn('btn-down',  '▼');
  createBtn('btn-jump',  '▲');
  createBtn('btn-fire',  '●');

  function layoutBtns(){
    var W = window.innerWidth;
    var H = window.innerHeight;
    var S = Math.min(W, H) * 0.17; // tamanho dos botões — maior
    var M = Math.min(W, H) * 0.03; // margem das bordas
    var G = Math.min(W, H) * 0.07; // gap entre botões — mais espaço

    // ---- LADO ESQUERDO ----
    // ◄ e ► na mesma linha
    var rowY  = H - M - S - S - G; // linha do ◄ ►
    var downY = H - M - S;         // linha do ▼

    // ◄ — mais à esquerda
    setPos('btn-left',  M,           rowY,  S, S);
    // ► — ao lado do ◄
    setPos('btn-right', M + S + G,   rowY,  S, S);
    // ▼ — embaixo, centralizado entre ◄ e ►
    setPos('btn-down',  M + S*0.25,  downY, S * 1.5, S * 0.75);

    // ---- LADO DIREITO ----
    var ACT = S * 1.15;
    var RX  = W - M - ACT;

    // ● fogo — canto inferior direito
    setPos('btn-fire', RX, H - M - ACT,         ACT, ACT);
    // ▲ pulo — acima do fogo
    setPos('btn-jump', RX, H - M - ACT*2 - G,   ACT, ACT);
  }

  function setPos(id, x, y, w, h){
    var el = document.getElementById(id);
    if(!el) return;
    el.style.left     = Math.round(x) + 'px';
    el.style.top      = Math.round(y) + 'px';
    el.style.width    = Math.round(w) + 'px';
    el.style.height   = Math.round(h) + 'px';
    el.style.fontSize = Math.round(Math.min(w,h) * 0.4) + 'px';
  }

  layoutBtns();
  window.addEventListener('resize', layoutBtns);
  window.addEventListener('orientationchange', function(){
    setTimeout(layoutBtns, 200);
  });

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
    if(id === 'btn-jump'){
      if(!INPUT._jumpHeld){
        INPUT.jumpPressed = true;
        INPUT._jumpHeld   = true;
      }
      setActive('btn-jump', true);
      return;
    }
    var field = BTN_MAP[id];
    if(field) INPUT[field] = true;
    setActive(id, true);
  }

  function releaseBtn(id){
    if(!id) return;
    if(id === 'btn-jump'){
      INPUT._jumpHeld = false;
      setActive('btn-jump', false);
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

// ============================================================
// GAMEPAD — Controle Xbox no browser Edge
// ============================================================
var GAMEPAD = {
  _jumpHeld: false,
};

INPUT.updateGamepad = function(){
  var gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
  var gp = null;

  // Pega o primeiro controle conectado
  for(var i = 0; i < gamepads.length; i++){
    if(gamepads[i]){ gp = gamepads[i]; break; }
  }
  if(!gp) return;

  // ---- BOTÕES Xbox ----
  // Índices padrão Xbox:
  // 0=A, 1=B, 2=X, 3=Y
  // 12=D-pad cima, 13=D-pad baixo, 14=D-pad esquerda, 15=D-pad direita
  // Analógico esquerdo: axes[0]=horizontal, axes[1]=vertical

  var dLeft  = gp.buttons[14] && gp.buttons[14].pressed || gp.axes[0] < -0.5;
  var dRight = gp.buttons[15] && gp.buttons[15].pressed || gp.axes[0] >  0.5;
  var dDown  = gp.buttons[13] && gp.buttons[13].pressed || gp.axes[1] >  0.5;
  var btnA   = gp.buttons[0]  && gp.buttons[0].pressed;  // A = pulo
  var btnX   = gp.buttons[2]  && gp.buttons[2].pressed;  // X = atirar
  var btnB   = gp.buttons[1]  && gp.buttons[1].pressed;  // B = atirar também
  var btnRB  = gp.buttons[5]  && gp.buttons[5].pressed;  // RB = atirar

  // Movimento
  INPUT.left  = dLeft;
  INPUT.right = dRight;
  INPUT.down  = dDown;
  INPUT.fire  = btnX || btnB || btnRB;

  // Pulo — dispara uma vez por pressão (não repete segurando)
  if(btnA && !GAMEPAD._jumpHeld){
    INPUT.jumpPressed = true;
    GAMEPAD._jumpHeld = true;
  }
  if(!btnA){
    GAMEPAD._jumpHeld = false;
  }
};
