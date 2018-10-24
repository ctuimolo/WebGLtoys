
var canvas;
var gl;

var points = [];
var colors = [];
var sqrPoints = [];
var sqrColors = [];

var NumTimesToSubdivide = 3;

// First, initialize the vertices of our 3D gasket
// Four vertices on unit circle
// Intial tetrahedron with equal length sides
    
var vertices = [
    vec3(  0.0000,  0.0000, -1.0000 ),
    vec3(  0.0000,  0.9428,  0.3333 ),
    vec3( -0.8165, -0.4714,  0.3333 ),
    vec3(  0.8165, -0.4714,  0.3333 )
];

var origin = [ 0, 0, 0 ];

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
	
	canvas.addEventListener
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our data for the Sierpinski Gasket
    //
    
    divideTetra( vertices[0], vertices[1], vertices[2], vertices[3],
                 NumTimesToSubdivide);

	square();
    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.9, 1.0 );
    
    // enable hidden-surface removal
    
    gl.enable(gl.DEPTH_TEST);

    //  Load shaders and initialize attribute buffers
    
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Create a buffer object, initialize it, and associate it with the
    //  associated attribute variable in our vertex shader
    
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );
	
	//var sqrCBuffer = gl.createBuffer();
	//gl.bindBuffer( gl.ARRAY_BUFFER, sqrCBuffer);
	//gl.bufferData( gl.ARRAY_BUFFER, flatten(sqrColors), gl.STATIC_DRAW );
	//gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
	
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );
	
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
	
	//var sqrBuffer = gl.createBuffer();
    //gl.bindBuffer( gl.ARRAY_BUFFER, sqrBuffer );
	//gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
	//gl.bufferData( gl.ARRAY_BUFFER, flatten(sqrPoints), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
	
	window.onkeydown = function( event ) {
        var key = event.keyCode;
        switch( key ) {
          case 87:
            doTranslate( 0, 0.06, 0 );
			origin[1] += 0.06;
            break;
			
		  case 65:
		    doTranslate( -0.06, 0, 0 );
			origin[0] += -0.06;
		    break;
		
		  case 83:
		    doTranslate( 0, -0.06, 0 );
			origin[1] += -0.06;
			break;
			
	      case 68:
		    doTranslate( 0.06, 0, 0 );
			origin[0] += 0.06;
			break;
			
		  case 81:
		    doTranslate( 0, 0, 0.06 );
			origin[2] += 0.06;
			break;
			
		  case 69:
		    doTranslate( 0, 0, -0.06 );
			origin[2] += -0.06;
			break;
        }
	}
	
	document.getElementById("sliderSub").onchange = function(event) {
        NumTimesToSubdivide = event.target.value;
		points = [];
		divideTetra( vertices[0], vertices[1], vertices[2], vertices[3], 
                NumTimesToSubdivide);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
		render();
    };
	
	document.getElementById("rotateX").onclick = function () {
		doRotate( 10, [1, 0, 0]);
	}

	document.getElementById("rotateY").onclick = function () {
		doRotate( 10, [0, 1, 0]);
	}

	document.getElementById("rotateZ").onclick = function () {
		doRotate( 10, [0, 0, 1]);
	}	

	document.getElementById("reset").onclick = function () {
		points = [];
		colors = [];
		vertices = [
			vec3(  0.0000,  0.0000, -1.0000 ),
			vec3(  0.0000,  0.9428,  0.3333 ),
			vec3( -0.8165, -0.4714,  0.3333 ),
			vec3(  0.8165, -0.4714,  0.3333 )
		];
		origin = [0, 0, 0];
		divideTetra( vertices[0], vertices[1], vertices[2], vertices[3], 
                NumTimesToSubdivide);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
		render();
	}
	
	document.getElementById("EQ").onclick = function () {
		sqrPoints = [];
		square();
		divideTetra( vertices[0], vertices[1], vertices[2], vertices[3], 
                NumTimesToSubdivide);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
		gl.bufferData( gl.ARRAY_BUFFER, flatten(sqrPoints), gl.STATIC_DRAW )
		render();
	}
	
    render();
};

function doTranslate( x, y, z ) {
	points = [];
	colors = [];
	var tra = translate( x, y, z );
	
	var tempMat = mat4( vertices[0][0], vertices[1][0], vertices[2][0], vertices[3][0],
 	                    vertices[0][1], vertices[1][1], vertices[2][1], vertices[3][1],
                        vertices[0][2], vertices[1][2], vertices[2][2], vertices[3][2],
						1, 1, 1, 1 );

	var product = mult( tra, tempMat );
	
	vertices = [ vec3( product[0][0], product[1][0], product[2][0] ),
	             vec3( product[0][1], product[1][1], product[2][1] ),
				 vec3( product[0][2], product[1][2], product[2][2] ),
				 vec3( product[0][3], product[1][3], product[2][3] ) ];
	

	
	divideTetra( vertices[0], vertices[1], vertices[2], vertices[3], 
            NumTimesToSubdivide);
	gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
	render();
}

//thx
function doRotate( angle, axis ) {
	points = [];
	colors = [];
	var nOrigin = subtract( vec3( 0, 0, 0), origin );
	var rot = rotate( angle, axis );
	var tra = translate( nOrigin[0], nOrigin[1], nOrigin[2] );
	
	var tempMat = mat4( vertices[0][0], vertices[1][0], vertices[2][0], vertices[3][0],
 	                    vertices[0][1], vertices[1][1], vertices[2][1], vertices[3][1],
                        vertices[0][2], vertices[1][2], vertices[2][2], vertices[3][2],
						1, 1, 1, 1 );

	var product = mult( tra, tempMat );
	product = mult( rot, product );
	
	tra = translate( origin[0], origin[1], origin[2] );
	product = mult( tra, product );
	
	vertices = [ vec3( product[0][0], product[1][0], product[2][0] ),
	             vec3( product[0][1], product[1][1], product[2][1] ),
				 vec3( product[0][2], product[1][2], product[2][2] ),
				 vec3( product[0][3], product[1][3], product[2][3] ) ];
	
	
	
	divideTetra( vertices[0], vertices[1], vertices[2], vertices[3], 
            NumTimesToSubdivide);
	gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
	render();
}

function square() {
	var baseColors = [
		vec3(0.0, 0.5, 0.7),
		vec3(0.0, 0.0, 0.2) 
	];
	var i = 0;
	for (var z = 100.0; z > -10; z -= 1) {
		var ran = Math.random()*0.2;
		for (var x = -10; x < 10; x += 1) {
			if (i % 2) {
			// Add 6 colors to current square.
				colors.push( baseColors[0]);
				colors.push( baseColors[0]);
				colors.push( baseColors[0]);
				colors.push( baseColors[0]);
				colors.push( baseColors[0]);
				colors.push( baseColors[0]);
			}
			else {
			// Add 6 different colors to current square.
				colors.push( baseColors[1]);
				colors.push( baseColors[1]);
				colors.push( baseColors[1]);
				colors.push( baseColors[1]);
				colors.push( baseColors[1]);
				colors.push( baseColors[1]);
			}
			// Add 6 points that make the square. Each point
				sqrPoints.push(vec3(x, -1.0 + ran, z));
				sqrPoints.push(vec3(x-1.0, -1.0, z));
				sqrPoints.push(vec3(x, -1.0, z-1.0));
				sqrPoints.push(vec3(x, -1.0, z-1.0));
				sqrPoints.push(vec3(x-1.0, -1.0, z-1.0));
				sqrPoints.push(vec3(x-1.0, -1.0 + ran, z));
			
			++i;
		}
		++i;
    }
}

function triangle( a, b, c, color )
{

    // add colors and vertices for one triangle

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

function tetra( a, b, c, d )
{
    // tetrahedron with each side using
    // a different color
    
    triangle( a, c, b, 0 );
    triangle( a, c, d, 1 );
    triangle( a, b, d, 2 );
    triangle( b, c, d, 3 );
}

function divideTetra( a, b, c, d, count )
{
    // check for end of recursion
    
    if ( count === 0 ) {
        tetra( a, b, c, d );
    }
    
    // find midpoints of sides
    // divide four smaller tetrahedra
    
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


function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.drawArrays( gl.TRIANGLES, 0, points.length );
	
	gl.bufferData( gl.ARRAY_BUFFER, flatten(sqrPoints), gl.STATIC_DRAW );
	gl.drawArrays( gl.TRIANGLES, 0, sqrPoints.length );
}

