export default class BasicCanvas {
    constructor(x, y, w, h) {
      this._x = x;
      this._y = y;
      this._w = w;
      this._h = h;
  
      // Create canvas
      this._canvas = document.createElement("CANVAS");
      this._canvas.width = w;
      this._canvas.height = h;
      this._canvas.classList.add('uno-game-canv-default');
  
      // Canvas style
      this._z_index = global.canvas_count;
      global.canvas_count++;
      this._canvas.style = `left: ${x}px; top: ${y}px; z-index: ${this._z_index};`;
  
      // Add to div
      global.uno_game_div.appendChild( this._canvas );
  
      // Get ctx
      this._ctx = this._canvas.getContext('2d');
    }
  
    get canvas() {
      return this._canvas;
    }
    set canvas(canvas) {
      this._canvas = canvas;
    }
  
    get ctx() {
      return this._ctx;
    }
    set ctx(ctx) {
      this._ctx = ctx;
    }
  
    clear() {
      this._ctx.clearRect(0, 0, global.uno_game_w, global.uno_game_h);
    }
  
    fillColor(i) {
      const colors = { 0: 'red', 1: 'yellow', 2: 'green', 3: 'blue' };
      this._ctx.fillStyle = colors[i];
      this._ctx.rect(0, 0, this._w, this._h);
      this._ctx.fill();
    }
  
    resetEventListener() {
      // clone canvas and replace w/o event listener
      const canvas = this._canvas.cloneNode(true);
      const ctx = canvas.getContext('2d');
      this._canvas.parentNode.replaceChild(canvas, this._canvas);
      ctx.drawImage(this._canvas, 0, 0)
      this._canvas.remove();
      this._canvas = canvas;
      this._ctx = ctx;
    }
  
    move(x, y) {
      this._x = x;
      this._y = y;
      this._canvas.style.left = x + 'px';
      this._canvas.style.top = y + 'px';
      this.refresh();
    }
  
    scale(scale) {
      this._canvas.style.width = this._w * scale + 'px';
      this._canvas.style.height = this._h * scale + 'px';
    }
  
    refresh() {
      this._canvas.style.zIndex = global.canvas_count;
      global.canvas_count++;
    }
  
    remove() {
      this._canvas.parentNode.removeChild( this._canvas );
      this._canvas.remove();
      //delete this._canvas;
    }
  
  }