// view.js

/* Class */
import BasicCanvas from './basic_canvas.js';
import Room from './room.js';
import Card from './card.js';
import Rule from './rule.js';

export default class View {
  constructor() {
    this._data = {};
    this._rule = new Rule();
    this._is_initialized = false;
  }

  showMainMenu() {
    // Create div
    const div = document.createElement('div');
    div.classList.add('uno-game-div');
    div.style.top = global.uno_game_h/4 + 'px';
    global.uno_game_div.appendChild( div );

    // Create UNO title
    const title = document.createElement('h1');
    title.innerHTML = 'UNO Game';
    title.classList.add('uno-game-main-title');
    div.appendChild( title );

    // label for input name
    const label_n = document.createElement('label');
    label_n.innerHTML = 'Input My Name';
    label_n.classList.add('uno-game-label');
    div.appendChild( label_n );

    // Input name
    const input_n = document.createElement('input');
    input_n.type = 'text';
    input_n.value = (this._my_name) ? this._my_name : '';
    input_n.className = 'uno-game-input';
    div.appendChild( input_n );

    // Create find room button
    const fr_btn = document.createElement('button');
    fr_btn.classList.add('uno-game-btn');
    fr_btn.innerHTML = 'Find Room';
    div.appendChild( fr_btn );

    // Add event
    //this._fr_btn.addEventListener("click", e => {
    //  this._my_name = input_n.value;
    //  this.clearMainMenu();
    //  this.findRoom();
    //  this._is_host = false;
    //});

    // Create create room button
    const cr_btn = document.createElement('button');
    cr_btn.classList.add('uno-game-btn');
    cr_btn.innerHTML = 'Create Room';
    div.appendChild( cr_btn );

    // Add event
    cr_btn.addEventListener("click", e => {
      this._my_name = input_n.value;
      div.remove();
      this.showCreateRoomMenu();
      this._is_host = true;
    });

  }

  showCreateRoomMenu() {
    // Create div
    const div = document.createElement('div');
    div.classList.add('uno-game-div');
    div.style.top = global.uno_game_h/4 + 'px';
    global.uno_game_div.appendChild( div );

    // Menu title
    const title = document.createElement('h2');
    title.innerHTML = 'Create Room';
    title.classList.add('uno-game-menu-title');
    div.appendChild( title );

    // label for input room name
    const label_rn = document.createElement('label');
    label_rn.innerHTML = 'Input Room Name';
    label_rn.classList.add('uno-game-label');
    div.appendChild( label_rn );

    // Input room name
    const input_rn = document.createElement('input');
    input_rn.type = 'text';
    input_rn.className = 'uno-game-input';
    div.appendChild( input_rn );

    // Confirm button
    const cfm_btn = document.createElement('button');
    cfm_btn.classList.add('uno-game-btn');
    cfm_btn.innerHTML = 'Confirm';
    div.appendChild( cfm_btn );

    cfm_btn.addEventListener('click', e => {
      this._room = new Room( input_rn.value );
      this.send({ctrl: 'addHuman', name: this._my_name});
      this._data = JSON.parse( this._room.respondData() );
      this.showRoom();
      div.remove();
    });

    // Back button
    const back_btn = document.createElement('button');
    back_btn.classList.add('uno-game-btn');
    back_btn.innerHTML = 'Back';
    div.appendChild( back_btn );

    back_btn.addEventListener('click', e => {
      div.remove();
      this.showMainMenu();
    });
  }

  async showRoom() {
    // Create div
    this._div = document.createElement('div');
    this._div.classList.add('uno-game-div');
    this._div.style.top = global.uno_game_h/5 + 'px';
    global.uno_game_div.appendChild( this._div );

    // Menu title
    const title = document.createElement('h2');
    title.innerHTML = this._data.room.name;
    title.classList.add('uno-game-menu-title');
    this._div.appendChild( title );

    if (this._is_host) {
      // Add bot button
      const ab_btn = document.createElement('button');
      ab_btn.classList.add('uno-game-btn');
      ab_btn.innerHTML = 'Add Bot';
      this._div.appendChild( ab_btn );

      ab_btn.addEventListener('click', e => {
        this.send({ctrl: 'addBot'});
      });

      // Start game button
      const sg_btn = document.createElement('button');
      sg_btn.classList.add('uno-game-btn');
      sg_btn.innerHTML = 'Star Game';
      this._div.appendChild( sg_btn );

      sg_btn.addEventListener('click', e => {
        this.send({ctrl: 'startGame'});
        this._div.remove();
      });
    }

    // List players
    const ul_pl = document.createElement('ul');
    ul_pl.classList.add('uno-game-ul');
    this._div.appendChild( ul_pl );

    this._data.players.forEach( (player) => {
      const li = document.createElement('li');
      li.classList.add('uno-game-li');
      li.innerHTML = player.name;
      ul_pl.appendChild( li );
    });

    if (!this._loop_started) {
      this._loop_started = true;
      this.loopReceiveData();
    }
  }

  async loopReceiveData() {
    let is_finished = false;
    while(true) {
      const data = await ( JSON.parse( this._room.respondData() ) );

      switch (data.game_status) {
        case 'ready':
          if ( JSON.stringify(this._data.players) != JSON.stringify(data.players) ) {
            this._data = data;
            this._div.remove();
            this.showRoom();
          }
          break;
        case 'start':
          if (!this._is_initialized) {
            await ( this.initCards() );
            await new Promise(resolve => setTimeout(resolve, 500)); // Sleep .5 s
            this._is_initialized = true;
          }
          if ( JSON.stringify(this._data.current_player) != JSON.stringify(data.current_player) ) {
            console.log('current_player changed')
            this._data = data;
            await ( this.updateCards() );
            if (data.current_player.name === this._my_name) this.myTurn();
          }
          break;
        case 'finish':
          this._data = data;
          await ( this.updateCards() );
          is_finished = true;
          this.gameFinish();
          break;
      }
      if (is_finished) break;
      await new Promise(resolve => setTimeout(resolve, 500)); // Sleep .5 s
    }
  }

  send(data) {
    this._room.receive(data);
  }

  async initCards() {
    console.log('init cards')
    this._cards = [];
    let count = 0
    for (let x=0; x<14; x++) {
      this._cards[x] = [];
    }
    for (let x=0; x<14; x++) {
      let num = x;
      for (let y=0; y<8; y++) {
        const color_n = y%4;
        if ( (x === 0) && (y >= 4) ) { // Skip blank card
          continue;
        }
        if ( (x === 13) && (y >= 4) ) { // +4 cards
          num = 14;
        }
        this._cards[x][y] = new Card(global.uno_game_w*6/16+count, global.uno_game_h/2, num, color_n);
        count++;
      }
    }
  }

  updateCards() {
    console.log('update cards view')
    // Player Cards
    const p_l = this._data.players.length;
    let p_cnt = 0;

    this._data.players.forEach( player => {
      const c_l = player.cards.length;

      for (let c=0; c<c_l; c++) {
        const x = player.cards[c].x;
        const y = player.cards[c].y;

        if (player.name === this._my_name) {
          const x0 = global.uno_game_w/4;
          const dx = global.uno_game_w/2 / (c_l+1);
          const y0 = global.uno_game_h*4/5;
          this._cards[x][y].drawImageFront(x0 + dx*(c+1), y0);
        } else {
          const x0 = global.uno_game_w*p_cnt/(p_l-1);
          const dx = global.uno_game_w/(p_l-1) / (c_l+2);
          const y0 = this.ellipticalFormula(x0 + dx*(c+1), global.uno_game_w/2, global.uno_game_h);
          this._cards[x][y].drawImageBack(x0 + dx*(c+1), y0);
        }
      }
      if (!(player.name === this._my_name)) p_cnt++;
    });

    // Remain cards
    for (let i=0; i<this._data.remain_cards.length; i++) {
      const x = this._data.remain_cards[i].x;
      const y = this._data.remain_cards[i].y;
      this._cards[x][y].drawImageBack(global.uno_game_w*6/16+i, global.uno_game_h/2);
    }

    // Discard piles
    for (let i=0; i<this._data.discard_piles.length; i++) {
      const x = this._data.discard_piles[i].x;
      const y = this._data.discard_piles[i].y;
      this._cards[x][y].drawImageFront(global.uno_game_w*8/16+i, global.uno_game_h/2);
    }

    // Discard pile top
    const discard_pile_top = this._cards[this._data.discard_pile_top.x][this._data.discard_pile_top.y];
    discard_pile_top.drawImageFront(global.uno_game_w*8/16+this._data.discard_piles.length+1, global.uno_game_h/2);
  }

  ellipticalFormula(x, a, b) {
    return b * ( 1 - Math.sqrt( 1 - (x/a - 1)**2 ) );
  }

  myTurn() {
    console.log('my turn');

    const top_draw_card_data = this._data.remain_cards[ this._data.remain_cards.length-1 ];
    this._top_draw_card = this._cards[top_draw_card_data.x][top_draw_card_data.y];
    this._top_draw_card.mouseEffect();

    // Select card event
    const bc_colors = [];
    this._data.current_player.cards.forEach( card_data => {
      const card = this._cards[card_data.x][card_data.y];
      if (this._rule.checkCardsMatch(this._data.discard_pile_top, card.data)) {
        card.mouseEffect();

        card.canvas.addEventListener('click', () => {
          // Show color change blocks
          if (card.num >= 13) {
            for (let i=0; i<4; i++) {
              const w = global.uno_game_w;
              const bc = new BasicCanvas(w/2+w*i/16, global.uno_game_h*3/4, w/16, w/16);
              bc.fillColor(i);
              bc.canvas.addEventListener('click', () => {
                console.log('played card num: ' + card.num + ', color: ' + card.color_n);

                // Remove event listeners
                this._top_draw_card.resetEventListener();
                this._data.current_player.cards.forEach( (card_data) => {
                  const card = this._cards[card_data.x][card_data.y];
                  card.resetEventListener();
                });
                bc_colors.forEach( bc_color => bc_color.remove() );

                this.send({ctrl: 'changeColor', color_n: i});
                this.send({
                  ctrl: 'playCard',
                  card: {num: card.num, color_n: card.color_n, x: card_data.x, y: card_data.y}
                });
              });
              bc_colors.push(bc);
            }
          } else {
            console.log('played card num: ' + card.num + ', color_n: ' + card.color_n);

            // Remove event listener
            this._top_draw_card.resetEventListener();
            this._data.current_player.cards.forEach( (card_data) => {
              const card = this._cards[card_data.x][card_data.y];
              card.resetEventListener();
            });
            bc_colors.forEach( bc_color => bc_color.remove() );

            this.send({
              ctrl: 'playCard',
              card: {num: card.num, color_n: card.color_n, x: card_data.x, y: card_data.y}
            });
          }
        });
      }
    });

    // Draw card event
    this._top_draw_card.canvas.addEventListener('click', () => {
      console.log('drawed card');

      // Remove event listener
      this._top_draw_card.resetEventListener();
      this._data.current_player.cards.forEach( (card_data) => {
        const card = this._cards[card_data.x][card_data.y];
        card.resetEventListener();
      });
      bc_colors.forEach( bc_color => bc_color.remove() );

      this.send({ctrl: 'drawCard'});
    });
  }

  gameFinish() {

  }
}