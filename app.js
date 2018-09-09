// Store frame for motion 
var previousFrame = null;
var paused = false;
var pauseOnGesture = false;

// Setup Leap loop with frame callback function
var controllerOptions = {enableGestures: true};

// to use HMD mode:
// controllerOptions.optimizeHMD = true;

var leftFingers = 0;
var rightFingers = 0;
var leftFingerNums = [];
var rightFingerNums = [];

Leap.loop(controllerOptions, function(frame) {
  if (paused) {
    return; // Skip this update
  }

    leftFingerNums = [];
    rightFingerNums = [];

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
            (hand.type=="left") ? leftFingerNums.push(finger.type) : rightFingerNums.push(finger.type)
        }
      }
      (hand.type=="left") ? leftFingers=extendedFingers : rightFingers=extendedFingers;
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
      gestureString += "Gesture ID: " + gesture.id + ", "
                    + "type: " + gesture.type + ", "
                    + "state: " + gesture.state + ", "
                    + "hand IDs: " + gesture.handIds.join(", ") + ", "
                    + "pointable IDs: " + gesture.pointableIds.join(", ") + ", "
                    + "duration: " + gesture.duration + " &micro;s, ";

      switch (gesture.type) {
        case "circle":
          gestureString += "center: " + vectorToString(gesture.center) + " mm, "
                        + "normal: " + vectorToString(gesture.normal, 2) + ", "
                        + "radius: " + gesture.radius.toFixed(1) + " mm, "
                        + "progress: " + gesture.progress.toFixed(2) + " rotations";
          break;
        case "swipe":
          gestureString += "start position: " + vectorToString(gesture.startPosition) + " mm, "
                        + "current position: " + vectorToString(gesture.position) + " mm, "
                        + "direction: " + vectorToString(gesture.direction, 1) + ", "
                        + "speed: " + gesture.speed.toFixed(1) + " mm/s";
          break;
        case "screenTap":
        case "keyTap":
          gestureString += "position: " + vectorToString(gesture.position) + " mm";
          break;
        default:
          gestureString += "unkown gesture type";
      }
      gestureString += "<br />";
    }
  }
  else {
    gestureString += "No gestures";
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

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    var canvas = document.getElementById("myCanvas");
    var ctx = canvas.getContext("2d");

    function ChopstickHand(user, side, fingerCount){
        this.user = user;
        this.side = side;
        this.fingerCount = fingerCount;
    } 
    function updateHand(hand, newFingerCount){
        hand.fingerCount = newFingerCount;
    }

    var enemyLeftHand = new ChopstickHand("enemy", "left", 1);
    var enemyRightHand = new ChopstickHand("enemy", "right", 1);
    var playerLeftHand = new ChopstickHand("player", "left", leftFingers);
    var playerRightHand = new ChopstickHand("player", "right", rightFingers);

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
        for(var i=0; i<enemyLeftHand.fingerCount; i++){
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
        for(var i=0; i<enemyRightHand.fingerCount; i++){
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
        ctx.fillStyle = "green";
        ctx.fill();
        ctx.closePath();

        //right palm
        ctx.beginPath();
        ctx.rect(280,360,80,80);
        ctx.fillStyle = "green";
        ctx.fill();
        ctx.closePath();

        //left fingers
        var initX = 195;
        for(var i=0; i<leftFingerNums.length; i++){
            var fing = leftFingerNums[i];
            var initY = (fing>0) ? 360 : 400;
            initX = (fing>0) ? 215-(20*fing) : 215;
            ctx.beginPath();
            ctx.rect(initX,initY,-15,-50);
            ctx.fillStyle = "green";
            ctx.fill();
            ctx.closePath();
        }

        //right fingers
        var initX = 285;
        for(var i=0; i<rightFingerNums.length; i++){
            var fing = rightFingerNums[i];
            var initY = (fing>0) ? 360 : 400;
            initX = (fing>0) ? 265+(20*fing) : 265;
            ctx.beginPath();
            ctx.rect(initX,initY,15,-50);
            ctx.fillStyle = "green";
            ctx.fill();
            ctx.closePath();
        }
    }

    function draw(){
        updateHand(playerLeftHand, leftFingers);
        updateHand(playerRightHand, rightFingers);
        ctx.clearRect(0,0,canvas.width, canvas.height);
        drawEnemyHands();
        drawPlayerHands();
    }
    setInterval(draw, 10);