// ============================================================
// audio.js — Sistema de áudio: músicas e efeitos sonoros
// ============================================================

var AUDIO_BASE = 'https://raw.githubusercontent.com/mcoscar-ai/gabriel/main/audio/';

var SOUNDS = {};
var currentMusic = null;
var musicVolume  = 0.5;
var sfxVolume    = 0.7;
var audioEnabled = true;

// Lista de arquivos
var AUDIO_LIST = [
  { key:'music_intro',    file:'music_intro.mp3',    loop:true,  type:'music' },
  { key:'music_zone1',    file:'music_zone1.mp3',    loop:true,  type:'music' },
  { key:'music_zone2',    file:'music_zone2.mp3',    loop:true,  type:'music' },
  { key:'music_zone3',    file:'music_zone3.mp3',    loop:true,  type:'music' },
  { key:'music_gameover', file:'music_gameover.mp3', loop:false, type:'music' },
  { key:'sfx_shot',       file:'sfx_shot.wav',       loop:false, type:'sfx'   },
  { key:'sfx_hit',        file:'sfx_hit.mp3',        loop:false, type:'sfx'   },
  { key:'sfx_jump',       file:'sfx_jump.ogg',       loop:false, type:'sfx'   },
  { key:'sfx_explosion',  file:'sfx_explosion.wav',  loop:false, type:'sfx'   },
];

// Carrega todos os áudios
function loadAllAudio(){
  AUDIO_LIST.forEach(function(a){
    var audio      = new Audio(AUDIO_BASE + a.file);
    audio.loop     = a.loop;
    audio.volume   = a.type==='music' ? musicVolume : sfxVolume;
    audio.preload  = 'auto';
    SOUNDS[a.key]  = audio;
  });
  console.log('🔊 Áudio inicializado');
}

// Toca música — troca suavemente
function playMusic(key){
  if(!audioEnabled) return;
  if(currentMusic === key) return; // já tocando
  stopMusic();
  var s = SOUNDS[key];
  if(!s) return;
  s.currentTime = 0;
  s.volume      = musicVolume;
  s.play().catch(function(){});
  currentMusic  = key;
}

// Para música atual
function stopMusic(){
  if(!currentMusic) return;
  var s = SOUNDS[currentMusic];
  if(s){ s.pause(); s.currentTime=0; }
  currentMusic = null;
}

// Toca efeito sonoro
function playSFX(key){
  if(!audioEnabled) return;
  var s = SOUNDS[key];
  if(!s) return;
  // Clona para permitir sobreposição
  var clone = s.cloneNode();
  clone.volume = sfxVolume;
  clone.play().catch(function(){});
}

// Atualiza música conforme estado do jogo
var _lastMusicState = '';
function updateMusic(){
  var state = GAME_STATE;
  var zone  = typeof getZone === 'function' ? getZone() : 1;
  var musicKey = '';

  if(state==='intro' || state==='title'){
    musicKey = 'music_intro';
  } else if(state==='playing'){
    musicKey = 'music_zone'+zone;
  } else if(state==='gameover'){
    musicKey = 'music_gameover';
  } else if(state==='win'){
    musicKey = 'music_intro';
  }

  if(musicKey !== _lastMusicState){
    _lastMusicState = musicKey;
    playMusic(musicKey);
  }
}
