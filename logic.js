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

var GameStatus = Object.freeze({"RUNNING":1, "OVER":2, "PAUSED":3});
var GameTurn = Object.freeze({"USER":1, "COMP":2});
var turnCounter = 0;

user = new Player("USER");
comp = new Player("COMP");

((Math.floor(Math.random()*2)+1) == 1) ? gameTurn = GameTurn.USER : gameTurn = GameTurn.COMP;
var status = GameStatus.RUNNING;

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