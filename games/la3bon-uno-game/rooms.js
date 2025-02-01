import Rule from './rule.js';

export default class Room {
  constructor(name) {
    this._rule = new Rule();

    this._name = name;
    this._players = [];
    this._remain_cards = [];
    this._discard_piles = [];
    this._discard_pile_top = {};
    this._current_player = {};
    this._game_status = 'ready';
  }

  receive(data) {
    if (data.ctrl === 'addHuman') this.addHuman(data.name);
    else if (data.ctrl === 'addBot') this.addBot();
    else if (data.ctrl === 'startGame') this.startGame();
    else if (data.ctrl === 'playCard') this.playCard(data.card);
    else if (data.ctrl === 'changeColor') this.changeColor(data.color_n);
    else if (data.ctrl === 'drawCard') this.drawCard();
  }

  addHuman(name) {
    this._players.push( {type: 'human', name: name, id: this._players.length } );
    console.log(this._players);
  }

  addBot() {
    this._players.push( {type: 'bot', name: 'bot'+this._players.length, id: this._players.length} );
    console.log(this._players);
  }

  respondData() {
    return JSON.stringify( {
      room: {
        name: this._name
      },
      players: this._players,
      remain_cards: this._remain_cards,
      discard_piles: this._discard_piles,
      discard_pile_top: this._discard_pile_top,
      current_player: this._current_player,
      game_status: this._game_status
    } );
  }

  async startGame() {
    console.log('[Room] Game start');

    // Init
    this._game_status = 'init';
    this._skip = false;
    this._reverse = false;
    this._draw2 = false;
    this._draw4 = false;
    this._wild = false;
    this._turn_count = 0,

    await ( this.initCards() );
    await new Promise(resolve => setTimeout(resolve, 100));
    await ( this.dealCards() );
    await new Promise(resolve => setTimeout(resolve, 100));
    await ( this.initDiscardPile() );
    await new Promise(resolve => setTimeout(resolve, 500));

    this._current_player = this._players[0];
    await new Promise(resolve => setTimeout(resolve, 500));
    this._game_status = 'start';

    this.initTurn();
  }

  initCards() {
    console.log('[Room] Initialize cards')

    const index_arr = [...Array(108).keys()]; // Create index pool
    for (let x=0; x<14; x++) {
      let num = x;
      for (let y=0; y<8; y++) {
        const color_n = y%4;
        if ( (x === 0) && (y >= 4) ) continue; // Skip blank card
        if ( (x === 13) && (y >= 4) ) num = 14; // +4 cards
        // Get random index
        const card_index = index_arr.splice(Math.floor( Math.random() * index_arr.length), 1)[0];
        this._remain_cards[ card_index ] = {num: num, color_n: color_n, x: x, y: y};
      }
    }
  }

  dealCards(n_deal_cards=7) {
    console.log('[Room] Deal cards')
    this._players.forEach( (player) => {
      player.cards = [];
      for (let i=0; i<n_deal_cards; i++) player.cards.push( this._remain_cards.pop() );
      player.cards.sort( (a, b) => (a.num > b.num) ? 1 : -1 );
    });
  }

  // Not allow special card to be first discard pile
  initDiscardPile() {
    while (true) {
      const card = this._remain_cards.pop();
      if (card.num <= 9) {
        this.changeTopCard( card );
        break;
      } else {
        // push back to a random position
        this._remain_cards.splice( Math.floor(Math.random()*this._remain_cards.length), 0, card);
      }
    }
  }

  async initTurn() {
    console.log('[Room] Turn count: ' + this._turn_count + ', current player: ' + this._current_player.name);
    await new Promise(resolve => setTimeout(resolve, 500));

    // check draw cards
    if (this._draw2) {
      this._draw2 = false;
      for (let i=0; i<2; i++) this._current_player.cards.push( this._remain_cards.pop() );
      this._current_player.cards.sort( (a, b) => (a.num > b.num) ? 1 : -1 );
      this.finishTurn();
    } else if (this._draw4) {
      this._draw4 = false;
      for (let i=0; i<4; i++) this._current_player.cards.push( this._remain_cards.pop() );
      this._current_player.cards.sort( (a, b) => (a.num > b.num) ? 1 : -1 );
      this.finishTurn();
    } else {
      if (this._current_player.type === 'bot') {
        this.botTurn();
      }
    }
  }

  async botTurn() {
    await new Promise(resolve => setTimeout(resolve, 500));

    const card = await ( this.botChooseCard() );

    if (card) {
      this.playCard(card);
    } else {
      this.drawCard();
    }
  }

  botChooseCard() {
    for (let i=0; i<this._current_player.cards.length; i++) {
      const card = this._current_player.cards[i];
      if ( this._rule.checkCardsMatch(this._discard_pile_top, card) ) {
        if (card.num >= 13) { // Change color
          this.changeColor( Math.floor( Math.random() * 4 ) );
        }
        return card;
      }
    }
    return null;
  }

  playCard(card) {
    console.log('[Room] played card num: ' + card.num + ', color: ' + card.color_n);
    const player = this._current_player;
    // Remove card from player cards
    player.cards.splice(player.cards.findIndex(c => (c.x === card.x && c.y === card.y)), 1);

    this.changeTopCard(card);
    this.finishTurn();
  }

  changeColor(color_n) {
    this._wild = true;
    this._wild_color_n = color_n;
  }

  drawCard() {
    const card = this._remain_cards.pop();
    console.log('[Room] drawed card num: ' + card.num + ', color: ' + card.color_n);

    this._current_player.cards.push(card);
    this._current_player.cards.sort( (a, b) => (a.num > b.num) ? 1 : -1 );
    this.finishTurn();
  }

  async finishTurn() {
    console.log('[Room] finish turn')

    await new Promise(resolve => setTimeout(resolve, 500));

    // Check empty
    if (this._current_player.cards.length === 0) {
      console.log('[Room] player: ' + this._current_player.name + ' has no card left. Game end');
      this._game_status = 'finish';
    } else {
      this._turn_count++;
      await ( this.decideNextPlayer() );
      this.initTurn();
    }
  }

  decideNextPlayer() {
    let current_player_id = this._current_player.id;
    let loop_cnt = 1;
    if (this._skip) {
      this._skip = false;
      loop_cnt++;
    }
    for (let i=0; i<loop_cnt; i++) {
      if (this._reverse) {
        if (current_player_id === 0) current_player_id = this._players.length - 1;
        else current_player_id--;
      } else {
        if (current_player_id === this._players.length-1) current_player_id = 0;
        else current_player_id++;
      }
    }
    this._current_player = this._players[current_player_id];
  }

  changeTopCard(card) {
    console.log('[Room] change top card num: ' + card.num + ', color_n: ' + card.color_n)
    if (this._discard_pile_top.x) this._discard_piles.push(this._discard_pile_top);
    this._discard_pile_top = card;
    if (this._wild) {
      this._wild = false;
      this._discard_pile_top.color_n = this._wild_color_n;
    }
    this.treatCard();
  }

  async treatCard() {
    switch (this._discard_pile_top.num) {
      case 10: // skip card
        this._skip = true;
        console.log('skip');
        break;
      case 11: // reverse card
        this._reverse = (this._reverse) ? false : true;
        console.log('reverse');
        break;
      case 12: // draw 2 card
        this._draw2 = true;
        console.log('next player draw 2 cards');
        break;
      case 13: // wild card (change color)
        console.log('change color: ' + this._discard_pile_top.color_n);
        break;
       case 14: // wild draw 4 card (change color)
        this._draw4 = true;
        console.log('next player draw 4 cards');
        console.log('change color: ' + this._discard_pile_top.color_n);
        break;
      default:
        break;
    }
  }

}