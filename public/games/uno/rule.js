export default class Rule {
    constructor() {
  
    }
  
    checkCardsMatch(card1, card2) {
      if ( (card2.num <= 12 && card1.num === card2.num) // Normal card
        || (card2.num >= 13) // Change color card
        || (card2.color_n === card1.color_n) ) { // Color match
        return true;
      } else {
        return false;
      }
    }
  }