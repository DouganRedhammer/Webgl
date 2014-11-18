/*
    Assignment 6
    Daniel Franklin
    
    This script produces randomly colored points (leaves) when the left mouse button is held down and moved around.
    Pressing the right mouse button then holding it while draging will causes the points (leaves) to move away from the mouse pointer.
    
    There is currently no collision between the leaves. This will result in the leaves clumping together after some time.
    There is also currently no acceleration in respects to gravity or mouse acceleration or reflection.

*/


function main() {
    
  // get the canvas element
  var canvas = document.getElementById("canvas");
  
  // get the webgl context
  var gl = canvas.getContext("webgl");
  if (!gl) {
    alert("Cannot get a WebGL context.");
    return;
  }
  
  // initialize the shaders
  if (!initShaders(gl, vertexShaderCode, fragmentShaderCode)) {
    alert('Cannot initialize the shaders.');
    return;
  }
  
  // get the storage location of attributes
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) { alert('Cannot get a_Position'); return; }
  var a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize');
  if (a_PointSize < 0) { alert('Cannot get a_PointSize'); return; }
  
  var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) { alert('Cannot get u_FragColor'); return; }
    
  // put values into the attributes
  gl.vertexAttrib1f(a_PointSize, 20.0);
  
  // add event listeners to fill attributes
  canvas.addEventListener("mousemove",
                          function(e)
                            { whichMouseDrag(e, gl, canvas, a_Position,u_FragColor); }
                         );
  canvas.addEventListener("mouseup",
                          function(e)
                            { whichMouseUp(e); }
                         );
  canvas.addEventListener("mousedown",
                          function(e)
                            {whichMouseDown(e, canvas); }
                         );
  // specify a clear value for color buffer
  // (note that GL colors are 0.0 to 1.0, not 0 to 255)
  gl.clearColor(0.0, 0.0, 0.0, 1.0); // black

  // clear the color buffer
  gl.clear(gl.COLOR_BUFFER_BIT);
    
    // setInterval(function() { animate(gl,a_Position,u_FragColor) },25);
    //see animate for why
    animate(gl,a_Position,u_FragColor);
}





var leaves = [];
var startingPoint = [];
var density = 10;
var isDraging = false;

//1 is left mouse, 2 or 3 is the left
function whichMouseDown(event, canvas){
    if ("which" in event){
        if(event.which == 3)
            console.log("right button")
        else if(event.which == 1)
            leftMouseDownAt(event, canvas)
    }
    else if ("button" in event){
        if(event.button == 2)
            console.log("right button")
        else if(event.button == 1)
            leftMouseDownAt(event, canvas)
    }
}

/*
    The following two functions differentiate the right and left mouse buttons, then calls the appropriate mouse functions
    1 is left mouse, 2 or 3 is the right
*/
function whichMouseDrag(e, gl, canvas, a_Position,u_FragColor){
    if ("which" in event){
        if(event.which == 3)
            rightMouseDrag(e, gl, canvas, a_Position,u_FragColor)
        else if(event.which == 1)
            leftMouseDrag(e, gl, canvas, a_Position,u_FragColor)
    }
    else if ("button" in event){
        if(event.button == 2)
            rightMouseDrag(e, gl, canvas, a_Position,u_FragColor)
        else if(event.button == 1)
            leftMouseDrag(e, gl, canvas, a_Position,u_FragColor)
    }
}

function whichMouseUp(e){
    if ("which" in event){
        if(event.which == 3)
            console.log("right button")
        else if(event.which == 1)
            leftMouseUpAt(e)
    }
    else if ("button" in event){
        if(event.button == 2)
            console.log("right button")
        else if(event.button == 1)
            leftMouseUpAt(e)
    }
}



//left mouse button actions
function leftMouseDownAt(event, canvas) {
  var x = (event.clientX - canvas.offsetLeft - canvas.width/2) / (canvas.width/2),
      y = (canvas.height/2 - (event.clientY - canvas.offsetTop)) / (canvas.height/2);
  startingPoint = [x,y];
  isDraging = true
}

function leftMouseDrag(e, gl, canvas, a_Position, u_FragColor){
  var x = (event.clientX - canvas.offsetLeft - canvas.width/2) / (canvas.width/2),
      y = (canvas.height/2 - (event.clientY - canvas.offsetTop)) / (canvas.height/2);
  
  if( calculateMousePtSeparation(x,y) >= density/100 && isDraging){

    startingPoint = [x,y]      
    var leaf = new Leaf(x,y);
    leaf.randomColor();
    leaves.push(leaf);
 
    // clear the color buffer
    gl.clear(gl.COLOR_BUFFER_BIT);

    // draw all the points stored in the clickCoords array
    var len = leaves.length;
    for (var i = 0; i < len; i++) {
        var leaf = leaves[i];
        gl.vertexAttrib3f(a_Position, leaf.getX(), leaf.getY(), 0.0);
        gl.uniform4f(u_FragColor, leaf.color.getR(), leaf.color.getG(), leaf.color.getB(), 1.0 );
        gl.drawArrays(gl.POINTS, 0, 1);
    }  
  }
};

function leftMouseUpAt(event){    
    startingPoint = [];
    isDraging = false
};
    

//Right mouse button events
function rightMouseDrag(e, gl, canvas, a_Position, u_FragColor){
    console.log("right drag")
  var x = (event.clientX - canvas.offsetLeft - canvas.width/2) / (canvas.width/2),
      y = (canvas.height/2 - (event.clientY - canvas.offsetTop)) / (canvas.height/2);
    var len = leaves.length;
    for (var i = 0; i < len; i++) {
        var leaf = leaves[i];
        
        if(leaf.calculateDistance(x,y) <= .3){
            var angle = leaf.getAngleOfApproch(x,y)
            
            // currentPosition = oldPosition + angle * distanceOffset 
            var dx = leaf.x + Math.cos(angle) * .03,
                dy = leaf.y + Math.sin(angle) * .03

                if(dx > .9)
                    leaf.x = .9;
                else if(dx < -.9)
                    leaf.x = -.9;
                else
                    leaf.x += Math.cos(angle) * .03
               
                if(dy > .9)
                    leaf.y = .9;
                else if(dy < -.9)
                    leaf.y = -.9;      
                else
                    leaf.y += Math.sin(angle) * .03
        }
    }
    // clear the color buffer
    gl.clear(gl.COLOR_BUFFER_BIT);

    // draw all the points stored in the clickCoords array
    for (var i = 0; i < len; i++) {
        var leaf = leaves[i];
        gl.vertexAttrib3f(a_Position, leaf.getX(), leaf.getY(), 0.0);
        gl.uniform4f(u_FragColor, leaf.color.getR(), leaf.color.getG(), leaf.color.getB(), 1.0 );
        gl.drawArrays(gl.POINTS, 0, 1);
    }  

};


function calculateMousePtSeparation(x,y){
    
  var dx = 0;
  var dy = 0;

  dx = Math.abs(x - startingPoint[0]);
  dx = dx * dx;

  dy = Math.abs(y - startingPoint[1]);
  dy = dy * dy;    
  return Math.sqrt(dx + dy)
}


//Update the y position of the falling leaves and the decay of the leaf's color.
function update(){
  var len = leaves.length;
  for (var i = 0; i < len; i++) {
      var y = leaves[i].getY();
      if(y >= - .99){ 
        leaves[i].setY(y -.01);
        leaves[i].updateColor();
      }
  }   
}

/*
    This fuction calls itself over and over via the requestAnimationFrame function. 
    It is significantly more efficient then settimeout and setinterval.
    
    
*/
function animate(gl, a_Position, u_FragColor){
    requestAnimationFrame(function() { animate(gl,a_Position,u_FragColor) });
    
  update();
  gl.clear(gl.COLOR_BUFFER_BIT);

  // draw all the points stored in the clickCoords array
  var len = leaves.length;
  for (var i = 0; i < len; i++) {
    var leaf = leaves[i];
    gl.vertexAttrib3f(a_Position, leaf.getX(), leaf.getY(), 0.0);
    gl.uniform4f(u_FragColor, leaf.color.getR(), leaf.color.getG(), leaf.color.getB(), 1.0 );
    gl.drawArrays(gl.POINTS, 0, 1);
  }
}

//Class to handle the leaf's color
function Color(r,g,b){
    this.r;
    this.g;
    this.b;
    
    this.getR = function(){
        return this.r;
    }
    this.getG = function(){
        return this.g;
    }
    this.getB = function(){
        return this.b;
    }
    
    this.setColor = function(r,g,b){
        this.r  = r;
        this.g  = g;
        this.b  = b;
    }
}

//Leaf Object
function Leaf(x, y){
    this.x = x;
    this.y = y;
    this.color = new Color(0,1,0);
    this.TTD;
    this.greenDecay = 1;
    this.redDecay = 0;
    
    //pick a random color between all green and all red.
    this.randomColor = function(){
        var min = 0.0,
            max = 1;
        this.redDecay= Math.random() * (max - min) + min;
        this.greenDecay= Math.random() * (max - min) + min;    
    
        this.color.setColor(this.redDecay,this.greenDecay,0)
    }

    this.updateColor = function(){
        //start with all green then prgress to all red
        this.greenDecay -= .002
        this.redDecay += .002
        this.color.setColor(this.redDecay, this.greenDecay, 0)
    }
        
    this.getX = function(){
        return this.x;
    }
    
    this.getY = function(){
        return this.y;
    }
     
    this.setX = function(x){
        this.x = x;
    }
    
    this.setY = function(y){
        this.y = y;
    }
    
    //calculates the distance between the mouse and the leaf
    this.calculateDistance = function(x,y){

      var dx = 0;
      var dy = 0;

      dx = Math.abs(x - this.x);
      dx = dx * dx;

      dy = Math.abs(y - this.y);
      dy = dy * dy;    
      return Math.sqrt(dx + dy)
    }

    // finds the angle of approach between the mouse and the leaf
    this.getAngleOfApproch = function(x,y){
        var dx = this.x - x;
        var dy = this.y - y
        return Math.atan2(dy, dx);                              
    }   
    
}

// Init shaders -----------------------------------------------

var vertexShaderCode = 
    'attribute vec4 a_Position; \n' +
    'attribute float a_PointSize; \n' +
    'void main() { \n' +
    '  gl_Position = a_Position; \n' + 
    '  gl_PointSize = a_PointSize; \n' +
    '} \n';

var fragmentShaderCode = 
    'precision mediump float; \n' +
    'uniform vec4 u_FragColor; \n' +
    'void main() { \n' +
    '  gl_FragColor = u_FragColor; \n' +
    '} \n';


function initShaders(gl, vshader, fshader) {
  
  var program = createProgram(gl, vshader, fshader);
  if (!program) {
    alert('Failed to create program');
    return false;
  }

  gl.useProgram(program);
  gl.program = program;
  return true;
}


function createProgram(gl, vshader, fshader) {
  
  // Create and compile the shader objects
  var vertexShader = createShader(gl, gl.VERTEX_SHADER, vshader);
  var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fshader);
  if (!vertexShader || !fragmentShader) return null;

  // Create a program object
  var program = gl.createProgram();
  if (!program) return null;

  // Attach the shader objects
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);

  // Link the program object
  gl.linkProgram(program);

  // Check the result of linking
  var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!linked) {
    alert('Failed to link program: ' + gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    gl.deleteShader(fragmentShader);
    gl.deleteShader(vertexShader);
    return null;
  }
  
  return program;
}


function createShader(gl, type, source) {
  
  // Create a shader object
  var shader = gl.createShader(type);
  if (shader == null) {
    alert('Unable to create shader');
    return null;
  }

  // Set the shader source and compile it
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  // Check the result of compilation
  var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!compiled) {
    alert('Failed to compile shader: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}
