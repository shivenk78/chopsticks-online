// Store frame for motion 
var previousFrame = null;
var paused = false;
var pauseOnGesture = false;

// Setup Leap loop with frame callback function
var controllerOptions = {enableGestures: true};

// to use HMD mode:
// controllerOptions.optimizeHMD = true;

class Hand{

    constructor(fingerCount, ifRight, ifActive, color) {
        this.ifRight = ifRight;
        this.fingerCount = fingerCount;
        //this.ifActive = ifActive;
        this.currColor = color;
        this.origColor = color;
        this.realTimeFingerCount;
        this.fingerTypes = [];
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

    /*set ifActive(ifActive){
        this.ifActive=ifActive;
        (this.ifActive) ? this.currColor = 'blue': this.currColor = this.origColor;
    }*/

    set realTimeFingerCount(realTimeFingerCount){
        this.realTimeFingerCount=realTimeFingerCount;
    }
  
}

class Player{
    constructor(name, color){
        this.name=name;
        this.color=color;
        this.rightHand = new Hand(1, true, false, color);
        this.leftHand = new Hand(1, false, false, color);
    }
}

var user = new Player("USER", "green");
var comp = new Player("COMP", "red");

Leap.loop(controllerOptions, function(frame) {
  if (paused) {
    return; // Skip this update
  }

    user.rightHand.fingerTypes = [];
    user.leftHand.fingerTypes = [];

  // Frame motion factors
  if (previousFrame && previousFrame.valid) {
    var rotationAxis = frame.rotationAxis(previousFrame);
    var rotationAngle = frame.rotationAngle(previousFrame);
    var scaleFactor = frame.scaleFactor(previousFrame);
  }

  // Display Hand object data
  var handString = "";
  if (frame.hands.length > 0) {
    for (var i = 0; i < frame.hands.length; i++) {
      var hand = frame.hands[i];

      // Hand motion factors
      if (previousFrame && previousFrame.valid) {
        var translation = hand.translation(previousFrame);
        handString += "Translation: " + vectorToString(translation) + " mm<br />";

        var rotationAxis = hand.rotationAxis(previousFrame, 2);
        var rotationAngle = hand.rotationAngle(previousFrame);
        handString += "Rotation axis: " + vectorToString(rotationAxis) + "<br />";
        handString += "Rotation angle: " + rotationAngle.toFixed(2) + " radians<br />";
      }

      var extendedFingers = 0;
      for(var f = 0; f < hand.fingers.length; f++){
        var finger = hand.fingers[f];
        if(finger.extended){
            extendedFingers++;
            (hand.type=="left") ? user.leftHand.fingerTypes.push(finger.type) : user.rightHand.fingerTypes.push(finger.type)
        }
      }
      (hand.type=="left") ? user.leftHand.realTimeFingerCount=extendedFingers : user.rightHand.realTimeFingerCount=extendedFingers;
    }
  }
  else {
    handString += "No hands";
  }

  // Display Gesture object data
  var gestureOutput = document.getElementById("gestureData");
  var gestureString = "";
  if (frame.gestures.length > 0) {
    if (pauseOnGesture) {
      togglePause();
    }
    for (var i = 0; i < frame.gestures.length; i++) {
      var gesture = frame.gestures[i];
    //   gestureString += "Gesture ID: " + gesture.id + ", "
    //                 + "type: " + gesture.type + ", "
    //                 + "state: " + gesture.state + ", "
    //                 + "hand IDs: " + gesture.handIds.join(", ") + ", "
    //                 + "pointable IDs: " + gesture.pointableIds.join(", ") + ", "
    //                 + "duration: " + gesture.duration + " &micro;s, ";

      switch (gesture.type) {
        case "circle":
            gestureString +="CIRCLE";
                        // += "center: " + vectorToString(gesture.center) + " mm, "
                        // + "normal: " + vectorToString(gesture.normal, 2) + ", "
                        // + "radius: " + gesture.radius.toFixed(1) + " mm, "
                        // + "progress: " + gesture.progress.toFixed(2) + " rotations";
            var circleHand = frame.hand(gesture.handIds[0]);
            var circleHandType = circleHand.type;
            if(circleHandType=="left"){
                //user.leftHand.ifActive(true);
                //user.rightHand.ifActive(false);
            }else{
                //user.rightHand.ifActive(true);
                //user.leftHand.ifActive(false);
            }
          break;
        case "swipe":
        //   gestureString += "start position: " + vectorToString(gesture.startPosition) + " mm, "
        //                 + "current position: " + vectorToString(gesture.position) + " mm, "
        //                 + "direction: " + vectorToString(gesture.direction, 1) + ", "
        //                 + "speed: " + gesture.speed.toFixed(1) + " mm/s";
          break;
        case "screenTap":
            gestureString+="Direction: "+vectorToString(gesture.direction,3)
                            +" Position: "+vectorToString(gesture.position,3)
                            +" Duration: "+gesture.duration;
            var currentHandType = activeHand();
            console.log(currentHandType);
            var targetDir = (gesture.direction[0]>0) ? "left" : "right";
            if( currentHandType=="right" || currentHandType=="left" ){
                if(targetDir=="left"){
                    console.log("TARGET LEFT");
                    (currentHandType=="left") ? user.leftHand.hit(comp.leftHand) : user.rightHand.hit(comp.leftHand) ;
                    //(currentHandType=="left") ? user.leftHand.ifActive(false) : user.rightHand.ifActive(false);
                }else{
                    console.log("TARGET RIGHT");
                    (currentHandType=="left") ? user.leftHand.hit(comp.rightHand) : user.rightHand.hit(comp.rightHand);
                    //(currentHandType=="left") ? user.leftHand.ifActive(false) : user.rightHand.ifActive(false);
                }
            }
        case "keyTap":
          //gestureString += "position: " + vectorToString(gesture.position) + " mm";
          break;
        default:
          gestureString += "unkown gesture type";
      }
      //gestureString += "<br />";
    }
  }
  console.log(gestureString);
  // Store frame for motion functions
  previousFrame = frame;
})

function vectorToString(vector, digits) {
  if (typeof digits === "undefined") {
    digits = 1;
  }
  return "(" + vector[0].toFixed(digits) + ", "
             + vector[1].toFixed(digits) + ", "
             + vector[2].toFixed(digits) + ")";
}

    //////////////////////////////////////////////////DRAWING SECTION//////////////////////////////////////////////////////////////
    var canvas = document.getElementById("myCanvas");
    var ctx = canvas.getContext("2d")

    function drawEnemyHands(){
        //left palm
        ctx.beginPath();
        ctx.rect(120,40,80,80);
        ctx.fillStyle = "red";
        ctx.fill();
        ctx.closePath();

        //right palm
        ctx.beginPath();
        ctx.rect(280,40,80,80);
        ctx.fillStyle = "red";
        ctx.fill();
        ctx.closePath();

        //left fingers
        var initX = 195;
        for(var i=0; i<comp.leftHand.fingerCount; i++){
            var initY = (i<4) ? 120 : 80;
            initX = (i<4) ? initX : 215;
            ctx.beginPath();
            ctx.rect(initX,initY,-15,50);
            ctx.fillStyle = "red";
            ctx.fill();
            ctx.closePath();
            initX-=20;
        }

        //right fingers
        var initX = 285;
        for(var i=0; i<comp.rightHand.fingerCount; i++){
            var initY = (i<4) ? 120 : 80;
            initX = (i<4) ? initX : 265;
            ctx.beginPath();
            ctx.rect(initX,initY,15,50);
            ctx.fillStyle = "red";
            ctx.fill();
            ctx.closePath();
            initX+=20;
        }
    }

    function drawPlayerHands(){
        

        //left palm
        ctx.beginPath();
        ctx.rect(120,360,80,80);
        ctx.fillStyle = user.leftHand.currColor;
        ctx.fill();
        ctx.closePath();

        //right palm
        ctx.beginPath();
        ctx.rect(280,360,80,80);
        ctx.fillStyle = user.rightHand.currColor;
        ctx.fill();
        ctx.closePath();

        //left fingers
        var initX = 195;
        for(var i=0; i<user.leftHand.fingerTypes.length; i++){
            var fing = user.leftHand.fingerTypes[i];
            var initY = (fing>0) ? 360 : 400;
            initX = (fing>0) ? 215-(20*fing) : 215;
            ctx.beginPath();
            ctx.rect(initX,initY,-15,-50);
            ctx.fillStyle = playerLeftHand.currColor;
            ctx.fill();
            ctx.closePath();
        }

        //right fingers
        var initX = 285;
        for(var i=0; i<user.rightHand.fingerTypes.length; i++){
            var fing = user.rightHand.fingerTypes[i];
            var initY = (fing>0) ? 360 : 400;
            initX = (fing>0) ? 265+(20*fing) : 265;
            ctx.beginPath();
            ctx.rect(initX,initY,15,-50);
            ctx.fillStyle = user.rightHand.currColor;
            ctx.fill();
            ctx.closePath();
        }
    }

    function draw(){
        ctx.clearRect(0,0,canvas.width, canvas.height);
        drawEnemyHands();
        drawPlayerHands();
    }
    setInterval(draw, 10);