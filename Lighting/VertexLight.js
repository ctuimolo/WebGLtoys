// Globals.
var canvas;
var gl;
var program;

var colors = [];
var points = [];

var lightson = 1.0;

var points2 = [];
var colors2 = [];

var normalsArray = [];

var NumTimesToSubdivide = 1;

var modeViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var lightPosition = [0.0, 1.0, -1.0, 0.0 ];
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialSpecular = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialShininess = 100.0;

var axis;
var theta = [0, Math.PI, 0];

var transX = 0.0;
var transY = 0.1;
var transZ = -1.0;

var scaleFactor = 0.5;

var view = mat4(1.0);

var FOV = 100;

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
	buildSphere();
	buildCheckeredFloor();
	drawCheckeredFloor();
	
	ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);
	
	ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);
	
    gl.uniform4fv( gl.getUniformLocation(program, 
       "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, 
       "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, 
       "specularProduct"),flatten(specularProduct) );	
    gl.uniform4fv( gl.getUniformLocation(program, 
       "lightPosition"),flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program, 
       "shininess"),materialShininess );	 
	   
	gl.uniform1f( gl.getUniformLocation(program, 
       "shade"),lightson );	   

	render();
	render();
		render();
	render();
		render();
	render();
		render();
	render();
		render();
	render();
	
/*    document.getElementById("subSlider").onchange = function (event) {
        NumTimesToSubdivide = event.target.value;
        render();
    };
*/
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
	
	document.getElementById( "light" ).onclick = function () {
		if( lightson == 0.0 ) {
			lightson = 1.0;
		}else {
			lightson = 0.0;
		}
		gl.uniform1f( gl.getUniformLocation(program, 
			"shade"),lightson );	
		render();
    };
	
	document.getElementById( "lightxplus" ).onclick = function () {
		lightPosition[0] += 0.1;
		gl.uniform4fv( gl.getUniformLocation(program, 
			"lightPosition"),flatten(lightPosition) );
		render();
    };
	
	document.getElementById( "lightxminus" ).onclick = function () {
		lightPosition[0] -= 0.1;
		gl.uniform4fv( gl.getUniformLocation(program, 
			"lightPosition"),flatten(lightPosition) );
		render();
    };

	document.getElementById( "lightyplus" ).onclick = function () {
		lightPosition[1] += 0.1;
		gl.uniform4fv( gl.getUniformLocation(program, 
			"lightPosition"),flatten(lightPosition) );
		render();
    };
	
	document.getElementById( "lightyminus" ).onclick = function () {
		lightPosition[1] -= 0.1;
		gl.uniform4fv( gl.getUniformLocation(program, 
			"lightPosition"),flatten(lightPosition) );
		render();
    };	
	
	document.getElementById( "lightzplus" ).onclick = function () {
		lightPosition[2] += 0.1;
		gl.uniform4fv( gl.getUniformLocation(program, 
			"lightPosition"),flatten(lightPosition) );
		render();
    };

	document.getElementById( "lightzminus" ).onclick = function () {
		lightPosition[2] -= 0.1;
		gl.uniform4fv( gl.getUniformLocation(program, 
			"lightPosition"),flatten(lightPosition) );
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
	gl.uniform1f( gl.getUniformLocation(program, 
	"shade"), 0.0 );
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    drawCheckeredFloor();
	gl.uniform1f( gl.getUniformLocation(program, 
	"shade"), lightson );
    gl.clear(gl.DEPTH_BUFFER_BIT);
    drawSphere();
}

function changeCamera( a, b ) {
	var lookAtMatrix = lookAt( a, b, vec3( 0, 1, 0 ));
	projectionMatrix = mult( projectionMatrix, lookAtMatrix );
}

function buildCheckeredFloor() {
    var i = 0;
    for (var z = 100.0; z > -100.0; z -= 5.0) {
        for (var x = -100.0; x < 100.0; x += 5.0) {
            if (i % 2) {
                colors2.push(vec3(0.0, 0.5, 0.7));
                colors2.push(vec3(0.0, 0.5, 0.7));
                colors2.push(vec3(0.0, 0.5, 0.7));
                colors2.push(vec3(0.0, 0.5, 0.7));
                colors2.push(vec3(0.0, 0.5, 0.7));
                colors2.push(vec3(0.0, 0.5, 0.7));
            }
            else {
                colors2.push(vec3(0.0, 0.0, 0.2));
                colors2.push(vec3(0.0, 0.0, 0.2));
                colors2.push(vec3(0.0, 0.0, 0.2));
                colors2.push(vec3(0.0, 0.0, 0.2));
                colors2.push(vec3(0.0, 0.0, 0.2));
                colors2.push(vec3(0.0, 0.0, 0.2));
            }
            points2.push(vec3(x, 0.0, z));
            points2.push(vec3(x, 0.0, z - 5.0));
            points2.push(vec3(x - 5.0, 0.0, z - 5.0));

            points2.push(vec3(x, 0.0, z));
            points2.push(vec3(x - 5.0, 0.0, z - 5.0));
            points2.push(vec3(x - 5.0, 0.0, z));
            ++i;
        }
        ++i;
    }
}

function drawCheckeredFloor() {

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points2), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors2), gl.STATIC_DRAW );

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

    gl.drawArrays( gl.TRIANGLES, 0, points2.length );
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

function buildSphere() {
	var angle = 0;
	var color1 = [0.6, 0.0, 0.2];
	var color2 = [0.0, 0.0, 0.6];
	var color3 = [0.2, 0.1, 0.6];
	
	var bottom = [0.0, -1.0, 0.0];
	var top = [0.0, 1.0, 0.0];
	
	
	while(angle <= 360) {
		points.push(bottom);
		colors.push(color1);
		points.push([Math.sin(radians(angle)), -0.5, Math.cos(radians(angle))]);
		colors.push(color2);
		angle += 72;
		points.push([Math.sin(radians(angle)), -0.5, Math.cos(radians(angle))]);
		colors.push(color3);
	}

	angle = 0;
	while(angle <= 360) {
		points.push([Math.sin(radians(angle)), -0.5, Math.cos(radians(angle))]);
		colors.push(color1);
		points.push([Math.sin(radians(angle+36)), 0.5, Math.cos(radians(angle+36))]);
		colors.push(color2);
		angle += 72;
		points.push([Math.sin(radians(angle)), -0.5, Math.cos(radians(angle))]);
		colors.push(color3);
	}
	
	angle = 36;
	while(angle <= 396) {
		points.push([Math.sin(radians(angle)), 0.5, Math.cos(radians(angle))]);
		colors.push(color3);
		angle += 72;		
		points.push(top);
		colors.push(color1);
		points.push([Math.sin(radians(angle)), 0.5, Math.cos(radians(angle))]);
		colors.push(color2);		
	}

	angle = 36;
	while(angle <= 396) {
		points.push([Math.sin(radians(angle+36)), -0.5, Math.cos(radians(angle+36))]);
		colors.push(color2);
		points.push([Math.sin(radians(angle)), 0.5, Math.cos(radians(angle))]);
		colors.push(color3);
		angle += 72;
		points.push([Math.sin(radians(angle)), 0.5, Math.cos(radians(angle))]);
		colors.push(color1);
	}	
	
	subdivide();
	subdivide();
}

function subdivide() {
	var tempPoints = [];
	colors = [];
	normalsArray = [];
	var index = 0;
	var color1 = [0.6, 0.0, 0.2];
	var color2 = [0.0, 0.0, 0.6];
	var color3 = [0.2, 0.1, 0.6];
	
	while( index < points.length ) {
	
		var a = points[index++];
		var b = points[index++];
		var c = points[index++];

        var ab = mix( a, b, 0.5);
        var ac = mix( a, c, 0.5);
        var bc = mix( b, c, 0.5);
                
		a = normalize(a, false);
        b = normalize(b, false);
        c = normalize(c, false);
        ab = normalize(ab, false);
        ac = normalize(ac, false);
        bc = normalize(bc, false);
	
		tempPoints.push( a, ab, ac );
		colors.push( color1, color2, color3 );
		tempPoints.push( ab, b, bc );
		colors.push( color1, color2, color3 );
		tempPoints.push( bc, c, ac );
		colors.push( color1, color2, color3 );
		tempPoints.push( ab, bc, ac );
		colors.push( color1, color2, color3 );
	}
	points = tempPoints;
}

function normalizeSphere() {
	var i = 0;
	while( i < points.length ) {
		var t1 = subtract(points[i+1], points[i]);
		var t2 = subtract(points[i+2], points[i]);
		var normal = normalize(cross(t1, t2));
		normal = vec4(normal);

		normalsArray.push(normal);
		normalsArray.push(normal);
		normalsArray.push(normal);
		i += 3;
	}
}

function drawSphere() {
	normalizeSphere();
    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );
    
    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);
	
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

/*
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
im a huge weeaboo
        --count;
        
        divideTetra(  a, ab, ac, ad, count );
        divideTetra( ab,  b, bc, bd, count );
        divideTetra( ac, bc,  c, cd, count );
        divideTetra( ad, bd, cd,  d, count );
    }
}
*/