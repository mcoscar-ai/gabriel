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

// KEYS global — acessível por todos
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

// Atualiza estado contínuo — chamado pelo game loop
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
  var BTN_SIZE   = Math.min(window.innerWidth, window.innerHeight) * 0.15;
  var BTN_MARGIN = BTN_SIZE * 0.2;
  var FIRE_SIZE  = BTN_SIZE * 1.1;
  var CX = BTN_MARGIN + BTN_SIZE;
  var CY = window.innerHeight - BTN_MARGIN - BTN_SIZE;

  function createBtn(id, x, y, w, h, label){
    var el = document.createElement('div');
    el.id = id;
    el.setAttribute('data-btn', id);
    el.style.cssText = [
      'position:fixed',
      'left:'   + x + 'px',
      'top:'    + y + 'px',
      'width:'  + w + 'px',
      'height:' + h + 'px',
      'background:rgba(255,255,255,0.08)',
      'border:2px solid rgba(255,255,255,0.25)',
      'border-radius:8px',
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'color:rgba(255,255,255,0.5)',
      'font-size:' + (w * 0.45) + 'px',
      'user-select:none',
      '-webkit-user-select:none',
      'z-index:1000',
      'touch-action:none',
    ].join(';');
    el.textContent = label;
    document.body.appendChild(el);
    return el;
  }

  createBtn('btn-up',    CX - BTN_SIZE/2,        CY - BTN_SIZE * 1.1,  BTN_SIZE, BTN_SIZE, '▲');
  createBtn('btn-down',  CX - BTN_SIZE/2,        CY + BTN_SIZE * 0.1,  BTN_SIZE, BTN_SIZE, '▼');
  createBtn('btn-left',  CX - BTN_SIZE * 1.6,    CY - BTN_SIZE/2,      BTN_SIZE, BTN_SIZE, '◄');
  createBtn('btn-right', CX + BTN_SIZE * 0.6,    CY - BTN_SIZE/2,      BTN_SIZE, BTN_SIZE, '►');

  var FX = window.innerWidth  - BTN_MARGIN - FIRE_SIZE;
  var FY = window.innerHeight - BTN_MARGIN - FIRE_SIZE;
  createBtn('btn-fire',  FX, FY, FIRE_SIZE, FIRE_SIZE, '●');

  function setActive(id, on){
    var el = document.getElementById(id);
    if(!el) return;
    el.style.background  = on ? 'rgba(255,255,100,0.35)' : 'rgba(255,255,255,0.08)';
    el.style.borderColor = on ? 'rgba(255,255,100,0.8)'  : 'rgba(255,255,255,0.25)';
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
    activeTouches  = {};
    INPUT._jumpHeld = false;
  }, { passive: false });

  // No mobile _updateKeyboard não faz nada
  INPUT._updateKeyboard = function(){};
}

INPUT.clearJump = function(){
  INPUT.jumpPressed = false;
};
