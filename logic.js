class Hand{

  constructor(ifRight, fingerCount) {
    this.ifRight=ifRight;
    this.fingerCount = fingerCount;
  }

  hit(hand){
    hand.fingerCount = hand.fingerCount + this.fingerCount;
  }

  transfer(hand, fingerCount){
    if((this.fingerCount-fingerCount) > 0){
      hand.fingerCount = hand.fingerCount + fingerCount;
      this.fingerCount = this.fingerCount - fingerCount;
    }
  }

}

class Player{

  constructor(name){
    this.name=name;
    this.rightHand = new Hand(true, 1);
    this.leftHand = new Hand(false, 1);
  }
}

function turn(user, comp){
  if(gameTurn == GameTurn.USER){
    var move = prompt("L/R/S?");
    var side = prompt("What side do you want to use?R/L");
    if(move==='L'){
      if(side === 'R'){ user.rightHand.hit(comp.leftHand)}
      if(side === 'L'){ user.leftHand.hit(comp.leftHand)}
    }else if(move === 'R'){
      if(side === 'R'){ user.rightHand.hit(comp.rightHand)}
      if(side === 'L'){ user.leftHand.hit(comp.rightHand)}
    }else{

    }
    gameTurn = GameTurn.COMP;
    clearInterval(refreshIntervalId);
  }else{
    var move = prompt("L/R/S?");
    var side = prompt("What side do you want to use?R/L");
    if(move==='L'){
      if(side === 'R'){ comp.rightHand.hit(user.leftHand)}
      if(side === 'L'){ comp.leftHand.hit(user.leftHand)}
    }else if(move === 'R'){
      if(side === 'R'){ comp.rightHand.hit(user.rightHand)}
      if(side === 'L'){ comp.leftHand.hit(user.rightHand)}
    }else{

    }
    gameTurn = GameTurn.USER;
    clearInterval(refreshIntervalId);
  }
}


var GameStatus = Object.freeze({"RUNNING":1, "OVER":2, "PAUSED":3});
var GameTurn = Object.freeze({"USER":1, "COMP":2});
var turnCounter = 0;

user = new Player("USER");
comp = new Player("COMP");

((Math.floor(Math.random()*2)+1) == 1) ? gameTurn = GameTurn.USER : gameTurn = GameTurn.COMP;
var status = GameStatus.RUNNING;

if(status == GameStatus.RUNNING){
  var refreshIntervalId = setInterval(turn, 10000);
}

  //THIS SECTION IS FOR CHECKING IF USER IS CHEATING/PLAYING
  var leapRightFingerCount; //RECIEVE INFO FROM LEAP
  //console.log(user.rightHand);
  if(user.rightHand.fingerCount != leapRightFingerCount){
    status = GameStatus.PAUSED;
  }

  var leapLeftFingerCount;//RECIEVE INFO FROM LEAP
  if(user.leftHand.fingerCount != leapLeftFingerCount){
    status = GameStatus.PAUSED;
  }

  turnCounter++;
  if(turnCounter == 10){
    status = GameStatus.PAUSED;
  }

  if(status = GameStatus.PAUSED){
  }