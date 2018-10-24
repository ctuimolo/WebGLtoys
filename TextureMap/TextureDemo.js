
var canvas;
var gl;


var vertices = [];
var indices = [];

var ttype = 0;

var transX = 0;
var transZ = 0;

var camY = 0.5;
var camZ = 0.0;

var lightPosition = vec4(0.0, 0.0, -2.0, 0.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 0.5, 0.5, 0.5, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialShininess = 100.0;

var lightson = 1.0;
var texon = 1.0;


function scale( x, y, z )
{
    var result = mat4();
    result[0][0] = x;
    result[1][1] = y;
    result[2][2] = z;
    return result;
}

// A simple data structure for our vertex data
function Vertex(position, texCoord, normal)
{
    var vertex =  [
            //Offset = 0
            position[0], position[1], position[2], 
            // Offset = 3
            normal[0], normal[1], normal[2], 
            //Offset = 6
            texCoord[0], texCoord[1] 
            //Size = Offset = 8 
        ];

    return vertex;
}

//Hard coded offsets and size because javascript doesn't have c style structs and sizeof operator
Vertex.offsetPosition = 0 * Float32Array.BYTES_PER_ELEMENT;
Vertex.offsetNormal = 3 * Float32Array.BYTES_PER_ELEMENT;
Vertex.offsetTexCoord = 6 * Float32Array.BYTES_PER_ELEMENT;
Vertex.size = 8 * Float32Array.BYTES_PER_ELEMENT;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
	gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
	
	// Load shaders
	program = initShaders( gl, "vertex-shader", "fragment-shader" );
	gl.useProgram( program )
	
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
	gl.uniform1f( gl.getUniformLocation(program, 
       "tex"),texon );	 

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.enable(gl.DEPTH_TEST)
    gl.clearColor( 0.9, 0.6, 1.0, 1.0 );

    // Generate the data for both a plane and a sphere
    GeneratePlane(indices, vertices);
    GenerateSphere(indices, vertices);

    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    // Associate our shader variables with the data from our vertices buffer
    // Data packed as {(position, normal, textureCoord),(position, normal, textureCoord)...}
    // Stride = Vertex.size = sizeof(Vertex)
    // Offset of position data = Vertex.offsetPosition = offsetof(Vertex, position)

    // If you don't understand what stride and offset do look at the documentation...
    // https://www.khronos.org/opengles/sdk/docs/man/xhtml/glVertexAttribPointer.xml

    var aPosition = gl.getAttribLocation( program, "aPosition" );
    gl.vertexAttribPointer( aPosition, 3, gl.FLOAT, false, Vertex.size, Vertex.offsetPosition);
    gl.enableVertexAttribArray( aPosition );

    // We didn't actually use aNormal in the shader so it will warn us. However if lighting was added they would be used.
    // INVALID_VALUE: vertexAttribPointer: index out of range 
    // INVALID_VALUE: enableVertexAttribArray: index out of range 
    var aNormal = gl.getAttribLocation( program, "aNormal" );
    gl.vertexAttribPointer( aNormal, 3, gl.FLOAT, false, Vertex.size, Vertex.offsetNormal );
    gl.enableVertexAttribArray( aNormal );

    var aTextureCoord = gl.getAttribLocation( program, "aTextureCoord" );
    gl.vertexAttribPointer( aTextureCoord, 2, gl.FLOAT, false, Vertex.size, Vertex.offsetTexCoord);
    gl.enableVertexAttribArray( aTextureCoord );


    gl.uniform1i( gl.getUniformLocation( program, "textureUnit0" ), 0); //Already 0 but lets be explicit
	
    document.getElementById( "texture1st" ).onclick = function () {
		ttype = 0;
    };
	
	document.getElementById( "texture2nd" ).onclick = function () {
		ttype = 1;
    };
	
	document.getElementById( "texture3rd" ).onclick = function () {
		ttype = 2;
    };
	
	document.getElementById( "texturetog" ).onclick = function () {
		texon -= 1;
		texon = Math.abs(texon);
		gl.uniform1f( gl.getUniformLocation(program, 
			"tex"),texon );	
    };
	
	document.getElementById( "lighttog" ).onclick = function () {
		lightson -= 1;
		lightson = Math.abs(lightson);
    	gl.uniform1f( gl.getUniformLocation(program, 
			"shade"), lightson );	
	};	
	
	document.getElementById( "reset" ).onclick = function () {
	    ttype = 0;
	
		transX = 0;
		transZ = 0;

		camY = 0.5;
		camZ = 0.0;
		Render(texture0, texture1);
    };
	
    //A texture that doesn't repeat and has bilinear filtering
    var texture0 = CreateTexture('Star.png',
        function(texture, image)
        {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        }
    );

    //A texture the repeats with nearest filtering
    var texture1 = CreateTexture('Checker.png',
        function(texture, image)
        {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        }
    );

    var texture2 = CreateTexture('Pink.png',
        function(texture, image)
        {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        }
    );
	
    //Rendering this scene will warn about not complete textures until they are loaded.
    var myVar = setInterval
    (
        function () 
        {
            if(ttype == 0) Render(texture0, texture1);
			if(ttype == 1) Render(texture1, texture1);
			if(ttype == 2) Render(texture2, texture1);
			if(ttype == 3) Render(texture3, texture1);
        }, 16
    );
	
    window.onkeydown = function( event ) {
        var key = event.keyCode;
        switch( key ) {
          case 73:              // J
            transX -= 0.1;
            break;

          case 75:				// L
            transX += 0.1;
            break;

          case 74:				// K
            transZ += 0.1;
            break;

          case 76:				// I
            transZ -= 0.1;
            break;
			
		  case 87:              // W
			camY += 0.1;
            break;
			
		  case 83:              // S
			camY -= 0.1;
            break;
			
		  case 65:              // A
			camZ += 0.1;
            break;
			
		  case 68:              // D
			camZ -= 0.1;
            break;
			
        }
		
		if(ttype == 0) Render(texture0, texture1);
		if(ttype == 1) Render(texture1, texture1);
		if(ttype == 2) Render(texture2, texture1);

    };
};

function CreateTexture(file, loaded) 
{
    var texture = gl.createTexture();
    var image = new Image();

    image.onload = function() 
    {
        loaded(texture, image);
    }
    image.src = file;

    return texture;
}

function GeneratePlane(indices, vertices)
{
    //The texture is in wrap = repeat so access outside the 0-1 mapped back into range.
    vertices.push(Vertex(vec3(-1, 0, -1), vec2(0, 0), vec3(0, 1, 0)));
    vertices.push(Vertex(vec3(-1, 0, 1), vec2(10, 0), vec3(0, 1, 0)));
    vertices.push(Vertex(vec3(1, 0, 1), vec2(10, 10), vec3(0, 1, 0)));
    vertices.push(Vertex(vec3(1, 0, -1), vec2(0, 10), vec3(0, 1, 0)));
    indices.push(0, 1, 2, 0, 2, 3);
}

function GenerateSphere(indices, vertices)
{

    var SPHERE_DIV = 25;

    var i, ai, si, ci;
    var j, aj, sj, cj;
    var p1, p2;

    var verticesBegin = vertices.length;

    // Generate coordinates
    for (j = 0; j <= SPHERE_DIV; j++) 
    {
        aj = j * Math.PI / SPHERE_DIV;
        sj = Math.sin(aj);
        cj = Math.cos(aj);

        for (i = 0; i <= SPHERE_DIV; i++) 
        {
            ai = i * 2 * Math.PI / SPHERE_DIV;
            si = Math.sin(ai);
            ci = Math.cos(ai);

            var x = si * sj;
            var y = cj;      
            var z = ci * sj; 
            vertices.push(Vertex(vec3(x, y, z), vec2(i/SPHERE_DIV, (1 - y)/2), vec3(x, y, z)));

        }
    }

    // Generate indices
    for (j = 0; j < SPHERE_DIV; j++) 
    {
        for (i = 0; i < SPHERE_DIV; i++) 
        {
            p1 = j * (SPHERE_DIV+1) + i;
            p2 = p1 + (SPHERE_DIV+1);

            indices.push(p1 + verticesBegin);
            indices.push(p2 + verticesBegin);
            indices.push(p1 + 1 + verticesBegin);

            indices.push(p1 + 1 + verticesBegin);
            indices.push(p2 + verticesBegin);
            indices.push(p2 + 1 + verticesBegin);
        }
    }
}

Render.time = 0;
function Render(texture0, texture1)
{
    Render.time += .16;
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	
    //View and projection are the same for both objects
    var projection = perspective(90, 1.0, 0.01, 50.0);
    var view = lookAt(vec3(1, camY, camZ), vec3(0, 0, 0), vec3(0, 1, 0));
    gl.uniformMatrix4fv( gl.getUniformLocation( program, "projection" ), false, flatten(projection));


    //PLANE
    //Bind the texture we want to use
    gl.bindTexture(gl.TEXTURE_2D, texture1); //assuming activeTexture = TEXTURE0

    var model = mult(translate(0, -1, 0), scale(2, 2, 2));
    var modelView = mult(view, model);
    gl.uniformMatrix4fv( gl.getUniformLocation( program, "modelView" ), false, flatten(modelView));

    //Draw the 6 indices of the plane
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    //END PLANE

    //SPHERE
    gl.bindTexture(gl.TEXTURE_2D, texture0); //assuming activeTexture = TEXTURE0

    var model = mult(mult(translate(transX, 0, transZ), scale(.5, .5, .5)), rotate(Render.time*10, vec3(0, 1, 0)));
    var modelView = mult(view, model);
    gl.uniformMatrix4fv( gl.getUniformLocation( program, "modelView" ), false, flatten(modelView));

    //Draw the indices of the sphere offset = 6 indices in the plane * sizeof(UNSIGNED_SHORT)
    gl.drawElements(gl.TRIANGLES, indices.length-6, gl.UNSIGNED_SHORT, 6 * Uint16Array.BYTES_PER_ELEMENT);
    //END SPHERE
}

