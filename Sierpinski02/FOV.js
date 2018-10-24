// Globals.
var canvas;
var gl;
var program;

var colors = [];
var points = [];

var NumTimesToSubdivide = 1;

var modeViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis;
var theta = [0, Math.PI, 0];

var transX = 0.0;
var transY = 0.1;
var transZ = -1.0;

var scaleFactor = 0.5;

var view = mat4(1.0);

var FOV = 90;

var eye = vec3( 0.0, 0.0, 0.0 );
var at  = vec3( 0.0, 0.0, -1.0 ); 

var changeEye = vec3( 0.0, 0.0, 0.0 );
var changeAt  = vec3( 0.0, 0.0, -1.0);

function initGl() {
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { 
        alert( "WebGL isn't available" );
    }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.9, 1.0 );
    gl.enable(gl.DEPTH_TEST);

    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    projectionMatrix = perspective(FOV, 1.0, 0.001, 100.0);
	changeCamera( eye, at );
}

window.onload = function init() {
    initGl();
    render();
	
	canvas.addEventListener("mousedown", doMouseDown, false);
	canvas.addEventListener("mouseout", doMouseUp, false);
	canvas.addEventListener("mouseup", doMouseUp, false);

    document.getElementById("subSlider").onchange = function (event) {
        NumTimesToSubdivide = event.target.value;
        render();
    };

    document.getElementById("fovSlider").onchange = function (event) {
        FOV = event.target.value;
		var tempX = changeAt[0];
		var tempY = changeAt[1];
		
		if( tempX > 0 ) {
			while( tempX > 0 ) {
				tempX--;
				changeCamera( eye, vec3( -0.1, 0.0, -1.0) );
			}
		}else if( tempX < 0) {
			while( tempX < 0 ) {
				tempX++;
				changeCamera( eye, vec3(0.1, 0.0, -1.0));
			}
		}
		if( tempY > 0 ) {
			while( tempY > 0 ) {
				tempY--;
				changeCamera( eye, vec3( 0.0, -0.1, -1.0) );
			}
		}else if( tempY < 0) {
			while( tempY < 0 ) {
				tempY++;
				changeCamera( eye, vec3( 0.0, 0.1, -1.0));
			}
		}
		//changeAt[0] = 0;
		//changeAt[1] = 0;
		projectionMatrix = perspective(FOV, 1.0, 0.001, 100.0);	

		if( tempY > changeAt[1] ) {
			while( tempY > changeAt[1] ) {
				tempY--;
				changeCamera( eye, vec3( 0.0, -0.1, -1.0) );
			}
		}else if( tempY < changeAt[1] ) {
			while( tempY < changeAt[1] ) {
				tempY++;
				changeCamera( eye, vec3( 0.0, 0.1, -1.0));
			}
		}
		if( tempX > changeAt[0] ) {
			while( tempX > changeAt[0] ) {
				tempX--;
				changeCamera( eye, vec3( -0.1, 0.0, -1.0) );
			}
		}else if( tempX < changeAt[0] ) {
			while( tempX < changeAt[0] ) {
				tempX++;
				changeCamera( eye, vec3( 0.1, 0.0, -1.0));
			}
		}
		
        render();
    };	
	
    document.getElementById( "xButton" ).onclick = function () {
        axis = xAxis;
        theta[axis] += Math.PI / 12;
        render();
    };

    document.getElementById( "yButton" ).onclick = function () {
        axis = yAxis;
        theta[axis] += Math.PI / 12;
        render();
    };

    document.getElementById( "zButton" ).onclick = function () {
        axis = zAxis;
        theta[axis] += Math.PI / 12;
        render();
    };
	
	document.getElementById( "resetE" ).onclick = function () {
		var tempX = changeAt[0];
		var tempY = changeAt[1];
		changeAt[0] = 0;
		changeAt[1] = 0;
		if( tempX > 0 ) {
			while( tempX > 0 ) {
				tempX--;
				changeCamera( eye, vec3( -0.1, 0.0, -1.0) );
			}
		}else if( tempX < 0) {
			while( tempX < 0 ) {
				tempX++;
				changeCamera( eye, vec3(0.1, 0.0, -1.0));
			}
		}
		if( tempY > 0 ) {
			while( tempY > 0 ) {
				tempY--;
				changeCamera( eye, vec3( 0.0, -0.1, -1.0) );
			}
		}else if( tempY < 0) {
			while( tempY < 0 ) {
				tempY++;
				changeCamera( eye, vec3( 0.0, 0.1, -1.0));
			}
		}
		render();
	 }

    document.getElementById( "resetG" ).onclick = function () {
        theta[xAxis] = 0;
		theta[yAxis] = Math.PI;
		theta[zAxis] = 0;
		NumTimesToSubdivide = 1;
		transX = 0.0;
        transY = 0.1;
		transZ = -1.0;
        render();
    };
	
    window.onkeydown = function( event ) {
        var key = event.keyCode;
        switch( key ) {
          case 73:
            transZ -= 0.1;
            break;

          case 75:
            transZ += 0.1;
            break;

          case 74:
            transX -= 0.1;
            break;

          case 76:
            transX += 0.1;
            break;
			
		  case 89:
            transY += 0.1;
            break;
			
		  case 72:
            transY -= 0.1;
            break;
			
		  case 87:              // W
			lookUp();
            break;
			
		  case 83:              // S
			lookDown();
            break;
			
		  case 65:              // A
			lookLeft();
            break;
			
		  case 68:              // D
			lookRight();
            break;
			
		  case 13:
			//changeCamera( vec3( 0.0, 0.0, -0.0 ), vec3( 0.0, 0.0, -1.0 ));
			break;
        }
        render();
    };
}

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    buildAndDrawCheckeredFloor();
    gl.clear(gl.DEPTH_BUFFER_BIT);
    buildAndDrawTetra();
}

function changeCamera( a, b ) {
	var lookAtMatrix = lookAt( a, b, vec3( 0, 1, 0 ));
	projectionMatrix = mult( projectionMatrix, lookAtMatrix );
}

function buildAndDrawCheckeredFloor() {
    var colors = [];
    var points = [];

    var i = 0;
    for (var z = 100.0; z > -100.0; z -= 5.0) {
        for (var x = -100.0; x < 100.0; x += 5.0) {
            if (i % 2) {
                colors.push(vec3(0.0, 0.5, 0.7));
                colors.push(vec3(0.0, 0.5, 0.7));
                colors.push(vec3(0.0, 0.5, 0.7));
                colors.push(vec3(0.0, 0.5, 0.7));
                colors.push(vec3(0.0, 0.5, 0.7));
                colors.push(vec3(0.0, 0.5, 0.7));
            }
            else {
                colors.push(vec3(0.0, 0.0, 0.2));
                colors.push(vec3(0.0, 0.0, 0.2));
                colors.push(vec3(0.0, 0.0, 0.2));
                colors.push(vec3(0.0, 0.0, 0.2));
                colors.push(vec3(0.0, 0.0, 0.2));
                colors.push(vec3(0.0, 0.0, 0.2));
            }
            points.push(vec3(x, 0.0, z));
            points.push(vec3(x, 0.0, z - 5.0));
            points.push(vec3(x - 5.0, 0.0, z - 5.0));

            points.push(vec3(x, 0.0, z));
            points.push(vec3(x - 5.0, 0.0, z - 5.0));
            points.push(vec3(x - 5.0, 0.0, z));
            ++i;
        }
        ++i;
    }

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

    modelViewMatrix = mat4( 1.0,  0.0,  0.0, 5.0,
                          0.0,  1.0,  0.0, -10.0,
                          0.0,  0.0,  1.0, -30.0,
                          0.0,  0.0,  0.0, 1.0 );

    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );

    gl.drawArrays( gl.TRIANGLES, 0, points.length );
}

function doMouseDown() {
	addEventListener("mousemove", doMouseMove, false);
}


function doMouseUp() {
	canvas.removeEventListener("mousemove", doMouseMove, false);
}

function lookUp() {
	var temp = changeAt[0];
  
	if( temp > 0 ) {
		while( temp > 0 ) {
			temp--;
			changeCamera( eye, vec3( -0.1, 0.0, -1.0) );
		}
	}else if( temp < 0) {
		while( temp < 0 ) {
			temp++;
			changeCamera( eye, vec3(0.1, 0.0, -1.0));
		}
	}
	
	changeAt[1] += 1;
	changeCamera( eye, vec3(0.0, 0.1, -1.0));
	
	if( temp > changeAt[0] ) {
		while( temp > changeAt[0] ) {
			temp--;
			changeCamera( eye, vec3( -0.1, 0.0, -1.0) );
		}
	}else if( temp < changeAt[0] ) {
		while( temp < changeAt[0] ) {
			temp++;
			changeCamera( eye, vec3(0.1, 0.0, -1.0));
		}
	}
}

function lookDown() {
	var temp = changeAt[0];
  
	if( temp > 0 ) {
		while( temp > 0 ) {
			temp--;
			changeCamera( eye, vec3( -0.1, 0.0, -1.0) );
		}
	}else if( temp < 0) {
		while( temp < 0 ) {
			temp++;
			changeCamera( eye, vec3(0.1, 0.0, -1.0));
		}
	}
			
	changeAt[1] -= 1;
	changeCamera( eye, vec3(0.0, -0.1, -1.0));
			
	if( temp > changeAt[0] ) {
		while( temp > changeAt[0] ) {
			temp--;
			changeCamera( eye, vec3( -0.1, 0.0, -1.0) );
		}
	}else if( temp < changeAt[0] ) {
		while( temp < changeAt[0] ) {
		temp++;
			changeCamera( eye, vec3(0.1, 0.0, -1.0));
		}
	}
}

function lookRight() {
	at = vec3( 0.1, 0.0, -1.0 );
	changeAt[0] += 1;
	changeCamera( eye, at );
}

function lookLeft() {
	at = vec3( -0.1, 0.0, -1.0 );
	changeAt[0] -= 1;
	changeCamera( eye, at );
}

function buildAndDrawTetra() {
    colors = [];
    points = [];

    var vertices = [
        vec3(  0.0000,  0.0000, -1.0000 ),
        vec3(  0.0000,  0.9428,  0.3333 ),
        vec3( -0.8165, -0.4714,  0.3333 ),
        vec3(  0.8165, -0.4714,  0.3333 )
    ];

    divideTetra(vertices[0], vertices[1], vertices[2], vertices[3], NumTimesToSubdivide);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );
    
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

    var scale = mat4( scaleFactor, 0.0,  0.0, 0.0,
                      0.0,  scaleFactor, 0.0, 0.0,
                      0.0,  0.0,  scaleFactor, 0.0,
                      0.0,  0.0,  0.0, 1.0 );

    var translate = mat4( 1.0,  0.0,  0.0, transX,
                          0.0,  1.0,  0.0, transY,
                          0.0,  0.0,  1.0, transZ,
                          0.0,  0.0,  0.0, 1.0 );

    var rotateX = mat4( 1.0,  0.0,  0.0, 0.0,
                        0.0,  Math.cos(theta[xAxis]),  Math.sin(theta[xAxis]), 0.0,
                        0.0,  -Math.sin(theta[xAxis]),  Math.cos(theta[xAxis]), 0.0,
                        0.0,  0.0,  0.0, 1.0 );

    var rotateY = mat4(Math.cos(theta[yAxis]),  0.0,  -Math.sin(theta[yAxis]), 0.0,
                        0.0,  1.0,  0.0, 0.0,
                        Math.sin(theta[yAxis]),  0.0,  Math.cos(theta[yAxis]), 0.0,
                        0.0,  0.0,  0.0, 1.0 );

    var rotateZ = mat4( Math.cos(theta[zAxis]),  -Math.sin(theta[zAxis]),  0.0, 0.0,
                        Math.sin(theta[zAxis]),  Math.cos(theta[zAxis]),  0.0, 0.0,
                        0.0,  0.0,  1.0, 0.0,
                        0.0,  0.0,  0.0, 1.0 );

    scale = mult(rotateX, scale);
    scale = mult(rotateY, scale);
    scale = mult(rotateZ, scale);
    
    scale = mult(translate, scale);

    modelViewMatrix = mult(view, scale);

    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );

    gl.drawArrays( gl.TRIANGLES, 0, points.length );
}

function triangle( a, b, c, color ) {
    var baseColors = [
        vec3(1.0, 0.0, 0.0),
        vec3(0.6, 0.0, 0.0),
        vec3(0.0, 0.6, 1.0),
        vec3(0.0, 0.0, 0.6)
    ];

    colors.push( baseColors[color] );
    points.push( a );
    colors.push( baseColors[color] );
    points.push( b );
    colors.push( baseColors[color] );
    points.push( c );
}

function tetra( a, b, c, d ) {
    triangle( a, c, b, 0 );
    triangle( a, c, d, 1 );
    triangle( a, b, d, 2 );
    triangle( b, c, d, 3 );
}

function divideTetra( a, b, c, d, count ) {
    if ( count === 0 ) {
        tetra( a, b, c, d );
    }
    else {
        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var ad = mix( a, d, 0.5 );
        var bc = mix( b, c, 0.5 );
        var bd = mix( b, d, 0.5 );
        var cd = mix( c, d, 0.5 );

        --count;
        
        divideTetra(  a, ab, ac, ad, count );
        divideTetra( ab,  b, bc, bd, count );
        divideTetra( ac, bc,  c, cd, count );
        divideTetra( ad, bd, cd,  d, count );
    }
}