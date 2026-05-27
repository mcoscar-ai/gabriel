// ============================================================
// input.js — Controles PC (teclado) e Mobile (cruz SNES)
// Expõe objeto global INPUT consultado pelos outros módulos
// ============================================================

// Estado global de input — todos os módulos leem daqui
var INPUT = {
  left:        false,
  right:       false,
  down:        false,
  fire:        false,
  // Pulo duplo — jumpPressed dispara UMA vez por toque/tecla
  jumpPressed: false,   // sobe para true por 1 frame quando pulo é solicitado
  _jumpHeld:   false,   // interno — evita pulo contínuo segurando a tecla
};

// Detecta se é dispositivo touch
var IS_MOBILE = ('ontouchstart' in window) ||
                navigator.maxTouchPoints > 0 ||
                window.matchMedia('(pointer:coarse)').matches;

// ============================================================
// PC — TECLADO
// ============================================================
(function(){
  if(IS_MOBILE) return; // no mobile não usa teclado

  var KEYS = {};

  window.addEventListener('keydown', function(e){
    KEYS[e.code] = true;

    // Pulo — dispara uma vez por pressão (não repete segurando)
    if((e.code === 'ArrowUp' || e.code === 'Space') && !INPUT._jumpHeld){
      INPUT.jumpPressed = true;
      INPUT._jumpHeld   = true;
    }

    // Bloqueia scroll da página pelas teclas do jogo
    if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].indexOf(e.code) !== -1){
      e.preventDefault();
    }
  });

  window.addEventListener('keyup', function(e){
    KEYS[e.code] = false;

    // Libera o pulo para poder pular de novo (duplo pulo)
    if(e.code === 'ArrowUp' || e.code === 'Space'){
      INPUT._jumpHeld = false;
    }
  });

  // Atualiza estado contínuo a cada frame (chamado pelo game loop)
  INPUT._updateKeyboard = function(){
    INPUT.left  = !!(KEYS['ArrowLeft']  || KEYS['KeyA']);
    INPUT.right = !!(KEYS['ArrowRight'] || KEYS['KeyD']);
    INPUT.down  = !!(KEYS['ArrowDown']  || KEYS['KeyS']);
    INPUT.fire  = !!(KEYS['KeyX']       || KEYS['KeyZ']);
  };
})();

// ============================================================
// MOBILE — CRUZ DIRECIONAL ESTILO SNES
// ============================================================
(function(){
  if(!IS_MOBILE) return;

  // Dimensões dos botões em % da tela — adapta qualquer tamanho
  var BTN_SIZE   = Math.min(window.innerWidth, window.innerHeight) * 0.15;
  var BTN_MARGIN = BTN_SIZE * 0.2;
  var FIRE_SIZE  = BTN_SIZE * 1.1;

  // Posição base da cruz (canto inferior esquerdo)
  var CX = BTN_MARGIN + BTN_SIZE;       // centro X da cruz
  var CY = window.innerHeight - BTN_MARGIN - BTN_SIZE; // centro Y da cruz

  // Cria um botão div touch
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

  // Cruz direcional — 4 botões em formato cruz
  // Cima
  createBtn('btn-up',
    CX - BTN_SIZE/2,
    CY - BTN_SIZE * 1.1,
    BTN_SIZE, BTN_SIZE, '▲');

  // Baixo
  createBtn('btn-down',
    CX - BTN_SIZE/2,
    CY + BTN_SIZE * 0.1,
    BTN_SIZE, BTN_SIZE, '▼');

  // Esquerda
  createBtn('btn-left',
    CX - BTN_SIZE * 1.6,
    CY - BTN_SIZE/2,
    BTN_SIZE, BTN_SIZE, '◄');

  // Direita
  createBtn('btn-right',
    CX + BTN_SIZE * 0.6,
    CY - BTN_SIZE/2,
    BTN_SIZE, BTN_SIZE, '►');

  // Botão de fogo — canto inferior direito
  var FX = window.innerWidth  - BTN_MARGIN - FIRE_SIZE;
  var FY = window.innerHeight - BTN_MARGIN - FIRE_SIZE;
  createBtn('btn-fire', FX, FY, FIRE_SIZE, FIRE_SIZE, '●');

  // Feedback visual — ilumina botão ao pressionar
  function setActive(id, on){
    var el = document.getElementById(id);
    if(!el) return;
    el.style.background = on
      ? 'rgba(255,255,100,0.35)'
      : 'rgba(255,255,255,0.08)';
    el.style.borderColor = on
      ? 'rgba(255,255,100,0.8)'
      : 'rgba(255,255,255,0.25)';
  }

  // Mapeia id do botão → campo do INPUT
  var BTN_MAP = {
    'btn-left':  'left',
    'btn-right': 'right',
    'btn-down':  'down',
    'btn-fire':  'fire',
  };

  // Rastreia qual botão cada dedo está segurando
  // { touchId: 'btn-id' }
  var activeTouches = {};

  // Descobre qual botão está na posição X,Y usando elementFromPoint
  // (técnica usada em jogos reais — funciona com deslize entre botões)
  function getBtnAt(x, y){
    var el = document.elementFromPoint(x, y);
    if(!el) return null;
    var btn = el.getAttribute('data-btn');
    return btn || null;
  }

  function pressBtn(id){
    if(!id) return;
    if(id === 'btn-up'){
      // Pulo — só dispara uma vez por toque
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

  // touchmove — usa elementFromPoint para deslize suave entre botões
  document.addEventListener('touchmove', function(e){
    e.preventDefault();
    for(var i = 0; i < e.changedTouches.length; i++){
      var t      = e.changedTouches[i];
      var oldBtn = activeTouches[t.identifier];
      var newBtn = getBtnAt(t.clientX, t.clientY);

      if(oldBtn !== newBtn){
        // Dedo deslizou para outro botão
        releaseBtn(oldBtn);
        activeTouches[t.identifier] = newBtn;
        pressBtn(newBtn);
      }
    }
  }, { passive: false });

  document.addEventListener('touchend', function(e){
    e.preventDefault();
    for(var i = 0; i < e.changedTouches.length; i++){
      var t   = e.changedTouches[i];
      var btn = activeTouches[t.identifier];
      releaseBtn(btn);
      delete activeTouches[t.identifier];
    }
  }, { passive: false });

  document.addEventListener('touchcancel', function(e){
    // Libera todos os botões se o touch for cancelado
    for(var id in activeTouches){
      releaseBtn(activeTouches[id]);
    }
    activeTouches = {};
    INPUT._jumpHeld = false;
  }, { passive: false });

  // No mobile não precisa de _updateKeyboard
  INPUT._updateKeyboard = function(){};
})();

// ============================================================
// clearJump — chamado pelo player.js após processar o pulo
// Reseta jumpPressed para não pular infinitamente
// ============================================================
INPUT.clearJump = function(){
  INPUT.jumpPressed = false;
};
