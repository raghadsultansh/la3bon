// index.js

/* Class */
import View from './js/view.js';
/* SCSS */
import './styles/uno-game.scss';
/* Image */
import green_table from './images/green_table.jpg';

// Global variables
global.canvas_count = 0; // increment number to avoid the same canvas id

// uno-game-div must be found
global.uno_game_div;
global.uno_game_w = window.innerWidth-1;
global.uno_game_h = window.innerHeight-1;

const view = new View();

/* Main view */
document.addEventListener('DOMContentLoaded', () => {
  console.log('UNO GAME')
  // Get uno-game div
  global.uno_game_div = document.getElementById('uno-game');
  global.uno_game_div.classList.add('uno-game-main-div');
  global.uno_game_div.style.height = global.uno_game_h +'px';

  // Set background to div
  global.uno_game_div.style.backgroundImage = 'url(' + green_table +')';

  view.showMainMenu();
});