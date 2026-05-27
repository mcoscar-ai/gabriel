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
// MOBILE — Cruz direcional estilo SNES (CSS % — funciona em
// qualquer orientação e tamanho de tela)
// ============================================================
if(IS_MOBILE){

  // Injeta CSS dos botões — tudo em % e vw/vh
  var style = document.createElement('style');
  style.textContent = [
    '.gbtn{',
      'position:fixed;',
      'width:12vmin;height:12vmin;',
      'background:rgba(255,255,255,0.08);',
      'border:2px solid rgba(255,255,255,0.25);',
      'border-radius:8px;',
      'display:flex;align-items:center;justify-content:center;',
      'color:rgba(255,255,255,0.55);',
      'font-size:5vmin;',
      'user-select:none;-webkit-user-select:none;',
      'z-index:1000;touch-action:none;',
    '}',
    '.gbtn.active{',
      'background:rgba(255,255,100,0.35);',
      'border-color:rgba(255,255,100,0.8);',
    '}',
    // Cruz — posicionada no canto inferior esquerdo
    '#btn-up   {left:14vmin; bottom:26vmin;}',
    '#btn-down  {left:14vmin; bottom:2vmin;}',
    '#btn-left  {left:1vmin;  bottom:14vmin;}',
    '#btn-right {left:27vmin; bottom:14vmin;}',
    // Botão de fogo — canto inferior direito
    '#btn-fire{',
      'width:14vmin;height:14vmin;',
      'right:3vmin;bottom:3vmin;',
      'border-radius:50%;',
      'font-size:6vmin;',
      'background:rgba(255,50,50,0.15);',
      'border-color:rgba(255,80,80,0.4);',
    '}',
    '#btn-fire.active{',
      'background:rgba(255,80,80,0.5);',
      'border-color:rgba(255,120,120,0.9);',
    '}',
  ].join('');
  document.head.appendChild(style);

  // Cria botão
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
