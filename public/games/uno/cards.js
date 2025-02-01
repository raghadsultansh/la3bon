import BasicCanvas from './basic_canvas.js';
/* Images */
import cards_img from '../images/cards.svg';
import card_back from '../images/card_back.svg';

export default class Card extends BasicCanvas {
  constructor(x, y, num, color_n) {
    super(x, y, global.uno_game_w/16, global.uno_game_w/16*360/240);

    this._c_w = 240;
    this._c_h = 360;

    this._num = num;
    this._color_n = color_n;

    this._cards_img = new Image();
    this._cards_img.src = cards_img;
    this._card_back_img = new Image();
    this._card_back_img.src = card_back;

    // Add border
    this._canvas.style.border = '1px solid #000000';

    // Add transition
    this._canvas.style.transition = '0.5s';

    // Fill
    this._card_back_img.addEventListener('load', () => {
      this._ctx.drawImage(this._card_back_img, 0, 0, this._w, this._h);
      this._is_front = false;
    });
  }

  set num(num) {
    this._num = num;
  }
  get num() {
    return this._num;
  }

  set color_n(color_n) {
    this._color_n = color_n;
  }
  get color_n() {
    return this._color_n;
  }

  set data(data) {
    this._num = data.num;
    this._color_n = data.color_n;
  }
  get data() {
    return {num: this._num, color_n: this._color_n};
  }

  isMatch(card) {
    if ( (card.num <= 12 && this._num === card.num) // Normal card
      || (card.num >= 13) // Change color card
      || (card.color_n === this._color_n) ) { // Color match
      return true;
    } else {
      return false;
    }
  }

  async drawImageFront(x, y) {
    if (x && y) this.move(x, y);
    this.clear();
    this._cards_img.src = await (cards_img);
    // Treat +4 card
    let num = this._num, color_n = this._color_n;
    if (num === 14) {
      num = 13;
      color_n += 4;
    }
    this._ctx.drawImage(this._cards_img, 1+this._c_w*num, 1+this._c_h*color_n, this._c_w, this._c_h,
        0, 0, this._w, this._h);
    this._is_front = true;
  }

  drawImageBack(x, y) {
    if (x && y) this.move(x, y);
    this.clear();
    this._ctx.drawImage(this._card_back_img, 0, 0, this._w, this._h);
    this._is_front = false;
  }

  mouseEffect() {
    this._canvas.addEventListener('mouseenter', () => {
      this._canvas.style.top = this._y - this._h/4 + 'px';
    });
    this._canvas.addEventListener('mouseleave', () => {
      this._canvas.style.top = this._y + 'px';
    });
  }

}