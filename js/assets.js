// ============================================================
// assets.js — URLs das imagens hospedadas no GitHub
// ============================================================

var BASE_URL = 'https://raw.githubusercontent.com/mcoscar-ai/gabriel/main/';

var ASSET_LIST = [
  // Backgrounds
  { key: 'bg1',           file: 'bg_beto.png'          },
  { key: 'bg2',           file: 'bg_zone2.png'          },
  { key: 'bg3',           file: 'bg_zone3.png'          },
  // Gabriel
  { key: 'idle',          file: 'gabriel_idle.png'      },
  { key: 'run1',          file: 'gabriel_run1.png'      },
  { key: 'run2',          file: 'gabriel_run2.png'      },
  { key: 'jump',          file: 'gabriel_jump.png'      },
  { key: 'crouch',        file: 'gabriel_crouch.png'    },
  { key: 'gabriel',       file: 'gabriel.png'           },
  // Inimigos
  { key: 'guard_light',   file: 'guard_light.png'       },
  { key: 'guard_normal',  file: 'guard_normal.png'      },
  { key: 'guard_armored', file: 'guard_armored.png'     },
  { key: 'drone',         file: 'drone.png'             },
  // Objetos
  { key: 'ammo',          file: 'ammo.png'              },
  { key: 'life',          file: 'life.png'              },
  { key: 'server',        file: 'server.png'            },
  // Telas
  { key: 'screen_title',    file: 'screen_title.png.png'  },
  { key: 'screen_room',     file: 'screen_room.png'       },
  { key: 'screen_win',      file: 'screen_win.png'        },
  { key: 'screen_gameover', file: 'game-over.png'         },
];

var IMGS = {};

function loadAllAssets(){
  var promises = ASSET_LIST.map(function(asset){
    return new Promise(function(resolve){
      var img = new Image();
      img.onload = function(){ IMGS[asset.key]=img; console.log('✅ Carregado:',asset.key); resolve(); };
      img.onerror = function(){ console.warn('❌ Erro:',asset.key); resolve(); };
      img.src = BASE_URL + asset.file;
    });
  });
  return Promise.all(promises);
}
