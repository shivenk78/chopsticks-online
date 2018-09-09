var http = require('http');
http.createServer(function (req, res) {

  class Hand{
    constructor(ifRight, fingerCount) {
      this.ifRight = ifRight;
      this.fingerCount = fingerCount;
      this.hit = function(hand){
        hand.fingerCount = hand.fingerCount + this.fingerCount;
      }
      this.transfer = function(hand, fingerCount){
        if((this.fingerCount-fingerCount) > 0){
          hand.fingerCount = hand.fingerCount + fingerCount;
          this.fingerCount = this.fingerCount - fingerCount;
        }
      }
    }
  }
  
  class Player{
    constructor(name){
      this.name=name;
      rightHand = new Hand(true, 1);
      leftHand = new Hand(false, 1);
    }
  }
  
  var GameStatus = Object.freeze({"RUNNING":1, "OVER":2, "PAUSED":3});
  var GameTurn = Object.freeze({"USER":1, "COMP":2});

  user = new Player("USER");
  comp = new Player("COMP");

  
  ((Math.floor(Math.random()*2)+1) == 1) ? gameTurn = GameTurn.USER : gameTurn = GameTurn.COMP;
  var status = GameStatus.RUNNING;
  while(status != GameStatus.OVER){
    if(status == GameStatus.RUNNING){
      if(gameTurn == GameTurn.USER){
        //USER HITS COMP RIGHT HAND  
        user.hit(comp.rightHand);
  
        //USER HITS COMP LEFT HAND
        user.hit(comp.leftHand);

        //USER TRANSFERS

      }else{
        //COMP HITS USER RIGHT HAND
        comp.hit(user.rightHand);

        //COMP HITS USER LEFT HAND
        comp.hit(user.leftHand);

        //COMP TRANSFERS
      }

      //THIS SECTION IS FOR CHECKING IF USER IS CHEATING/PLAYING
      var leapRightFingerCount; //RECIEVE INFO FROM LEAP
      if(user.rightHand.fingerCount != leapRightFingerCount){
        status = GameStatus.PAUSED;
      }

      var leapLeftFingerCount;//RECIEVE INFO FROM LEAP
      if(user.leftHand.fingerCount != leapLeftFingerCount){
        status = GameStatus.PAUSED;
      }

    }

    if(status == GameStatus.PAUSED){
      
    }
  }


}).listen(1337, "127.0.0.1");
console.log('Server running at http://127.0.0.1:1337/');

