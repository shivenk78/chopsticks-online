// Store frame for motion 
var previousFrame = null;
var paused = false;
var pauseOnGesture = false;

// Setup Leap loop with frame callback function
var controllerOptions = {enableGestures: true};

// to use HMD mode:
// controllerOptions.optimizeHMD = true;

var GameStatus = Object.freeze({"RUNNING":1, "OVER":2, "PAUSED":3});
var gameStatus = GameStatus.RUNNING;

var Turn = Object.freeze({"USER":1, "COMP":2});
var turn = Turn.USER;

var anticheat = true;
function toggleCheat(){
    anticheat = !anticheat;
}

var leftFingers = 0;
var rightFingers = 0;

var isTrain = false;

function delay(){
    for(var i=0; i<2000000000; i++){
    }
    console.log("Delay Done");
}

class Hand{

    constructor(fingerCount, ifRight, color) {
        this.ifRight = ifRight;
        this.fingerCount = fingerCount;
        this.ifActive = false;
        this.currColor = color;
        this.origColor = color;
        this.fingerTypes = [];
    }
  
    hit(hand){
        if(hand.fingerCount > 0){
            hand.fingerCount = hand.fingerCount + this.fingerCount;
        }
        delay();   
    }
  
    transfer(hand, fingerCount){
      if((this.fingerCount-fingerCount) > 0){
        hand.fingerCount = hand.fingerCount + fingerCount;
        this.fingerCount = this.fingerCount - fingerCount;
      }
    }

    isActive(ifActive){
        this.ifActive=ifActive;
        (this.ifActive) ? this.currColor = 'blue': this.currColor = this.origColor;
    }

    /*set realTimeFingerCount(realTimeFingerCount){
        this.realTimeFingerCount=realTimeFingerCount;
    }*/
}

class Player{
    constructor(name, color){
        this.name=name;
        this.color=color;
        this.rightHand = new Hand(1, true, color);
        this.leftHand = new Hand(1, false, color);
    }
}

var user = new Player("USER", "green");
var comp = new Player("COMP", "red");
// Machine Learning

let brain;
let userR, userL, cpuR, cpuL;

let userSplit;
let userRightCpuRight;
let userRightCpuLeft;
let userLeftCpuRight;
let userLeftCpuLeft;
let outputs;
let inputs;
var once = true;

function generateScenario() {
    userR = Math.floor(Math.random()*5);
    userL = Math.floor(Math.random()*5);
    cpuR = Math.floor(Math.random()*5);
    cpuL = Math.floor(Math.random()*5);
    console.log("userR: " + userR);
    console.log("userL: " + userL);
    console.log("cpuR: " + cpuR);
    console.log("cpuL: " + cpuL);
}

brain = new NeuralNetwork(4, 4, 5);

function predictor() {
    inputs = [user.rightHand.fingerCount, user.leftHand.fingerCount, comp.rightHand.fingerCount, comp.leftHand.fingerCount];
    outputs = brain.predict(inputs);
    console.log(outputs);
}

function toggleTrain(){
    isTrain = !isTrain;
    if(isTrain){
        training();
    }
}

function training()
{
    while(isTrain){
        var x;
        x = prompt("What's your move?", "[Your hand][Hand to attack] - LR means your left hitting their right. split to split"), 10;
        generateScenario();
        
        if (x == "predict") {
            predictor();
        } else {
        
            let targets;
            if (x == "RR")            
                targets = [1,0,0,0,0];
            if (x == "RL") 
                targets = [0,1,0,0,0];
            if (x == "LR") 
                targets = [0,0,1,0,0];
            if (x == "LL") 
                targets = [0,0,0,1,0];
            if (x == "split") 
                targets = [0,0,0,0,1];
        // console.log(targets);
        // console.log(x);
        let inputs = [userR, userL, cpuR, cpuL];
        brain.train(inputs, targets);
        } 
    }
}

Leap.loop(controllerOptions, function(frame) {
  if (paused) {
    return; // Skip this update
  }

    user.rightHand.fingerTypes = [];
    user.leftHand.fingerTypes = [];

    console.log(turn);

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
                
                if(anticheat){
                    if(hand.type=="left" && extendedFingers <= user.leftHand.fingerCount){
                        user.leftHand.fingerTypes.push(finger.type)
                    }
                    if(hand.type=="right" && extendedFingers <= user.rightHand.fingerCount){
                        user.rightHand.fingerTypes.push(finger.type)
                    }
                }else{
                    (hand.type=="left") ? user.leftHand.fingerTypes.push(finger.type) : user.rightHand.fingerTypes.push(finger.type);
                }      
            }
        }
        (hand.type=="left") ? leftFingers=extendedFingers : rightFingers=extendedFingers;
        }
    }
    else {
        handString += "No hands";
    }

  //detect cheating/changes
  if(turn = Turn.USER){
    var total = user.rightHand.fingerCount + user.leftHand.fingerCount;
    var totalNew = rightFingers+leftFingers;
    if(total == totalNew){
        user.rightHand.fingerCount = rightFingers;
        user.leftHand.fingerCount = leftFingers;
    }else if(user.rightHand.fingerCount != rightFingers){
        gameStatus = GameStatus.PAUSED;
    }else if(user.leftHand.fingerCount != leftFingers){
        gameStatus = GameStatus.PAUSED;
    }
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
            console.log(turn+"fuck u");
            if(turn == Turn.USER){
                if(circleHandType=="left"){
                    user.leftHand.isActive(true);
                    user.rightHand.isActive(false);
                }else{
                    if(circleHandType=="right"){
                        user.rightHand.isActive(true);
                        user.leftHand.isActive(false); 
                    }else{
                        user.rightHand.isActive(false);
                        user.leftHand.isActive(false); 
                    }       
                }
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
            var currentHandType = (user.leftHand.currColor=="blue") ? "left" : "right";
            var targetDir = (gesture.direction[0]>0) ? "left" : "right";
            if(turn == Turn.USER){
                if( currentHandType=="right" || currentHandType=="left" ){
                    if(targetDir=="left"){
                        (currentHandType=="left") ? user.leftHand.hit(comp.leftHand) : user.rightHand.hit(comp.leftHand) ;
                        (currentHandType=="left") ? user.leftHand.isActive(false) : user.rightHand.isActive(false);
                        (comp.leftHand.fingerCount >= 5) ? comp.leftHand.fingerCount = 0: '';
                    }else{
                        (currentHandType=="left") ? user.leftHand.hit(comp.rightHand) : user.rightHand.hit(comp.rightHand);
                        (currentHandType=="left") ? user.leftHand.isActive(false) : user.rightHand.isActive(false);
                        (comp.rightHand.fingerCount >= 5) ? comp.rightHand.fingerCount = 0: '';
                    }

                    if(comp.leftHand.fingerCount == 0 && comp.rightHand.fingerCount == 0){
                        gameStatus = GameStatus.OVER;
                    }
                    turn = Turn.COMP;
                    console.log("Comp Turn");
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

    // if(turn = Turn.COMP){
    if(turn == Turn.COMP){
        predictor();
        max = outputs[0];
        max_pos = 0;
        for (var i = 1; i < outputs.length; i++)
        {
            if (max < outputs[i])
                max_pos = i;
        if(max_pos==0)
            comp.rightHand.hit(user.rightHand);
        if(max_pos==1)
            comp.rightHand.hit(user.leftHand);
        if(max_pos==2)
            comp.leftHand.hit(user.rightHand);
        if(max_pos==3)
            comp.leftHand.hit(user.leftHand);
        }

        turn=Turn.USER;
    }
  
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
        ctx.fillStyle = user.leftHand.currColor;
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


