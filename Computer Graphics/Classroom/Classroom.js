// Vertex shader
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'attribute vec4 a_Normal;\n' +
  'attribute vec2 a_TexCoords;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'uniform mat4 u_ModelMatrix;\n' +    // Model matrix
  'uniform mat4 u_NormalMatrix;\n' +   // Transformation matrix of the normal
  'varying vec4 v_Color;\n' +
  'varying vec3 v_Normal;\n' +
  'varying vec2 v_TexCoords;\n' +
  'varying vec3 v_Position;\n' +
  'void main() {\n' +
  '  gl_Position = u_MvpMatrix * a_Position;\n' +
     // Calculate the vertex position in the world coordinate
  '  v_Position = vec3(u_ModelMatrix * a_Position);\n' +
  '  v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
  '  v_Color = a_Color;\n' + 
  '  v_TexCoords = a_TexCoords;\n' +
  '}\n';
// Fragment shader
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'uniform int u_UseTextures;\n' +    // each number corresponds to a different texture (1..6) otherwise no texture
  'uniform bool u_DirectionalToggle;\n' +//boolean toggle variables for the light sources
  'uniform bool u_Point1Toggle;\n' +
  'uniform bool u_Point2Toggle;\n' + 
  'uniform bool u_AmbientToggle;\n' + 
  'uniform bool u_background_toggle;\n' + 
  'uniform vec3 u_LightColor;\n' +     // Light color
  'uniform vec3 u_Light1Position;\n' +  // Position of the light source
  'uniform vec3 u_Light2Position;\n' +  // Position of the light source
  'uniform vec3 u_AmbientLight;\n' +   // Ambient light color
  'varying vec3 v_Normal;\n' +
  'varying vec3 v_Position;\n' +
  'varying vec4 v_Color;\n' +
  'uniform sampler2D u_Sampler0;\n' +//6 samplers for each texture image
  'uniform sampler2D u_Sampler1;\n' +
  'uniform sampler2D u_Sampler2;\n' +
  'uniform sampler2D u_Sampler3;\n' +
  'uniform sampler2D u_Sampler4;\n' +
  'uniform sampler2D u_Sampler5;\n' +
  'varying vec2 v_TexCoords;\n' +
  'void main() {\n' +
     // Normalize the normal because it is interpolated and not 1.0 in length any more
  '  vec3 normal = normalize(v_Normal);\n' +
     // Calculate the light direction and make its length 1.
  '  vec3 light1Direction = normalize(u_Light1Position - v_Position);\n' +
  '  vec3 light2Direction = normalize(u_Light2Position - v_Position);\n' +
     // The dot products of the light direction and the orientation of a surface (the normal)
  '  float nDotL = 0.0;\n' +
  '  if (u_DirectionalToggle) {\n' +//Toggle light sources
  '     nDotL = 0.2*max(dot(vec3(-1.0, -1.0, 1.0), normal), 0.0);\n' +
  '  }\n' +
  '  if (u_Point1Toggle) {\n' +
  '     nDotL += max(dot(light1Direction, normal), 0.0);\n' +
  '  }\n' +
  '  if (u_Point2Toggle) {\n' +
  '     nDotL += max(dot(light2Direction, normal), 0.0);\n' +
  '  }\n' +
     // Calculate the final color from diffuse reflection and ambient reflection
  '  float alpha = v_Color.a;\n' +
  '  vec3 diffuse;\n' +
  '  if (u_UseTextures == 1) {\n' +
  '     vec4 TexColor = texture2D(u_Sampler0, v_TexCoords);\n' +
  '     diffuse = u_LightColor * TexColor.rgb * nDotL * 0.3;\n' +
  '     alpha = 0.2;\n' +
  '  } else if (u_UseTextures == 2) {\n' +
  '     vec4 TexColor = texture2D(u_Sampler1, v_TexCoords);\n' +
  '     diffuse = u_LightColor * TexColor.rgb * nDotL * 1.2;\n' +
  '  } else if (u_UseTextures == 3) {\n' +
  '     vec4 TexColor = texture2D(u_Sampler2, v_TexCoords);\n' +
  '     diffuse = u_LightColor * TexColor.rgb * nDotL * 1.2;\n' +
  '  } else if (u_UseTextures == 4) {\n' +
  '     vec4 TexColor = texture2D(u_Sampler3, v_TexCoords);\n' +
  '     diffuse = u_LightColor * TexColor.rgb * nDotL * 1.2;\n' +
  '  } else if (u_UseTextures == 5) {\n' +
  '     vec4 TexColor = texture2D(u_Sampler4, v_TexCoords);\n' +
  '     diffuse = u_LightColor * TexColor.rgb * nDotL * 1.2;\n' +
  '  } else if (u_UseTextures == 6) {\n' +
  '     vec4 TexColor = texture2D(u_Sampler5, v_TexCoords);\n' +
  '     diffuse = u_LightColor * TexColor.rgb * nDotL * 1.2;\n' +
  '  } else {\n' +//Toggle directional light
  '     diffuse = u_LightColor * v_Color.rgb * nDotL;\n' +
  '  }\n' +
  '  if (u_background_toggle) {\n' +
  '     alpha = 1.0;\n' +
  '  }\n' +
  '  vec3 ambient = vec3(0.0, 0.0, 0.0);\n' +
  '  if (u_AmbientToggle) {\n' +
  '     ambient = u_AmbientLight * v_Color.rgb;\n' +
  '  }\n' +
  '  gl_FragColor = vec4(diffuse + ambient, alpha);\n' +
  //alpha is the alpha value of v_Color (1.0, apart from the sky image I used, so light from the background can come through the windows)
  '}\n';
//CAMERA MOVEMENT VARS:
//The initial x-z positions must be orientated like this to make the key controls work.
//(the distance between the eye and the center must equal the radius, eye z must be positive, greater than the center z)
var eye_x = 0.0;
var eye_y = 5.0;
var eye_z = 5.0;
var center_x = 0.0;
var center_y = 5.0;
var center_z = 0.0;
var radius = 5.0;
var theta = 0.0;
//OBJECT MOVEMENT VARS:
var door_angle = 0.0;
var chair1z = 0.0;
var table1z = 0.0;
var chair2z = 0.0;
var table2z = 0.0;
//TOGGLE VARS:
var point1on = true;
var point2on = true;
var ambOn = true;
var directionalOn = true;
var background_toggle = false;

function main() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');
  // Get the rendering context for WebGL
  gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }
  // Set the clear color and enable the depth test
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  // Get the storage locations of uniform variables

  var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  var u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
  var u_DirectionalToggle = gl.getUniformLocation(gl.program, 'u_DirectionalToggle');
  var u_Point1Toggle = gl.getUniformLocation(gl.program, 'u_Point1Toggle');
  var u_Point2Toggle = gl.getUniformLocation(gl.program, 'u_Point2Toggle');
  var u_AmbientToggle = gl.getUniformLocation(gl.program, 'u_AmbientToggle');
  var u_background_toggle = gl.getUniformLocation(gl.program, 'u_background_toggle');
  var u_Light1Position = gl.getUniformLocation(gl.program, 'u_Light1Position');
  var u_Light2Position = gl.getUniformLocation(gl.program, 'u_Light2Position');
  var u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');
  if (!u_ModelMatrix || !u_MvpMatrix || !u_NormalMatrix || !u_LightColor || !u_Light1Position || !u_Light2Position || !u_AmbientLight || !u_DirectionalToggle || !u_Point1Toggle || !u_Point2Toggle || !u_AmbientToggle) { 
    console.log('Failed to get the storage location');
    return;
  }
  //initialise the toggles
  gl.uniform1i(u_DirectionalToggle, true);
  gl.uniform1i(u_Point1Toggle, true);
  gl.uniform1i(u_Point2Toggle, true);
  gl.uniform1i(u_AmbientToggle, true);
  gl.uniform1i(u_background_toggle, false);
  
  // Set the light color (white)
  gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
  // Set the light direction (in the world coordinate)
  gl.uniform3f(u_Light1Position, 10.0, 10.0, 10.0);
  gl.uniform3f(u_Light2Position, -10.0, 10.0, -10.0);
  // Set the ambient light
  gl.uniform3f(u_AmbientLight, 0.1, 0.1, 0.1);

  var viewProjMatrix = new Matrix4();
  viewProjMatrix.setPerspective(50.0, canvas.width / canvas.height, 1.0, 100.0);
  viewProjMatrix.lookAt(eye_x, eye_y, eye_z, center_x, center_y, center_z, 0.0, 1.0, 0.0);

  // Register the event handler to be called when keys are pressed
  document.onkeydown = function(ev){ keydown(ev, gl, n, viewProjMatrix, u_ModelMatrix, u_MvpMatrix, u_NormalMatrix, u_DirectionalToggle, u_Point1Toggle, u_Point2Toggle, u_AmbientToggle, u_background_toggle); };

  draw(gl, n, viewProjMatrix, u_ModelMatrix, u_MvpMatrix, u_NormalMatrix);
}

var mvpMatrix = new Matrix4();    // Model view projection matrix
var normalMatrix = new Matrix4(); 
// Coordinate transformation matrix
var g_modelMatrix = new Matrix4(), g_mvpMatrix = new Matrix4();

function draw(gl, n, viewProjMatrix, u_ModelMatrix, u_MvpMatrix, u_NormalMatrix) {
//Load all the textures into these two arrays
  var textures = [];
  var samplers = [];
  //these are the sampler variable names we search for, and the image sources
  var samplers_names = ['u_Sampler0', 'u_Sampler1', 'u_Sampler2', 'u_Sampler3', 'u_Sampler4', 'u_Sampler5'];
  var image_sources = ['../resources/sky.jpg', '../resources/wood.jpg', '../resources/door.jpg', '../resources/white_board.jpg', '../resources/floor.jpg', '../resources/wall.jpg'];
  
  for (var i = 0; i < samplers_names.length; i++) {
    var Cubetexture = gl.createTexture();
    Cubetexture.image = new Image();
    var u_Sampler = gl.getUniformLocation(gl.program, samplers_names[i])//add the sampler variable in the frag shader to the textures array
    samplers.push(u_Sampler);
    Cubetexture.image.src = image_sources[i];//link an image to our texture object and add it to the textures array
    textures.push(Cubetexture);
    if (!Cubetexture) {
      console.log('Failed to create the texture object ' + i);
      return false;
    }
    if (!u_Sampler) { 
      console.log('Failed to get the storage location of u_Sampler' + i); 
      return false;
    }
    if (!Cubetexture.image) { 
      console.log('Failed to create the image object ' + i); 
      return false;
    }
  }
  // now all the textures have been loaded, build the world in the next function:
  (Cubetexture).image.onload = function(){ build_world(gl, n, textures, samplers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix); };  
}

var g_normalMatrix = new Matrix4(); // Coordinate transformation matrix for normals

function build_world(gl, n, textures, samplers, viewProjMatrix, u_MvpMatrix, u_NormalMatrix) {
  
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis

  //pass build " gl.TEXTURE0, textures[0], samplers[0], 0" to bind the first texture,
  //pass build " gl.TEXTURE1, textures[1], samplers[1], 1 " to bind the second texture, etc.
  //pass build "-1" as the 7th param to not bind a texture


//FLOOR
  g_modelMatrix.setTranslate(0.0, -10.0, 0.0);
  build(gl, n, 20.0, 0.1, 20.0, gl.TEXTURE4, textures[4], samplers[4], 4, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  //CEILING
  g_modelMatrix.setTranslate(0.0, 30.0, 0.0);
  build(gl, n, 20.0, 0.1, 20.0, gl.TEXTURE5, textures[5], samplers[5], 5, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  //WALLS
  g_modelMatrix.setTranslate(0.0, 10.0, 40.0);
  build(gl, n, 20.0, 10.0, 0.1, gl.TEXTURE5, textures[5], samplers[5], 5, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  g_modelMatrix.setTranslate(40.0, 10.0, 0.0);
  build(gl, n, 0.1, 10.0, 20.0, gl.TEXTURE5, textures[5], samplers[5], 5, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  //WHITE BOARD
  g_modelMatrix.setTranslate(0.0, 10.0, 39.0);
  build(gl, n, 10.0, 6.0, 0.1, gl.TEXTURE3, textures[3], samplers[3], 3, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);

  //WALL with gap for window
  g_modelMatrix.setTranslate(-40.0, 24.0, 0.0);
  build(gl, n, 0.1, 3.0, 20.0, gl.TEXTURE5, textures[5], samplers[5], 5, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  g_modelMatrix.setTranslate(-40.0, -4.0, 0.0);
  build(gl, n, 0.1, 3.0, 20.0, gl.TEXTURE5, textures[5], samplers[5], 5, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  g_modelMatrix.setTranslate(-40.0, 10.0, 32.0);
  build(gl, n, 0.1, 4.0, 4.0, gl.TEXTURE5, textures[5], samplers[5], 5, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  g_modelMatrix.setTranslate(-40.0, 10.0, -32.0);
  build(gl, n, 0.1, 4.0, 4.0, gl.TEXTURE5, textures[5], samplers[5], 5, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  g_modelMatrix.setTranslate(-40.0, 10.0, 0.0);
  build(gl, n, 0.1, 4.0, 2.0, gl.TEXTURE5, textures[5], samplers[5], 5, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);

  //WINDOW FRAMES
  g_modelMatrix.setTranslate(-39.5, 10.0, 4.0);
  build(gl, n, 0.1, 4.3, 0.2, gl.TEXTURE1, textures[1], samplers[1], 1, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  g_modelMatrix.setTranslate(-39.5, 10.0, 14.0);
  build(gl, n, 0.1, 4.0, 0.2, gl.TEXTURE1, textures[1], samplers[1], 1, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  g_modelMatrix.setTranslate(-39.5, 10.0, 24.0);
  build(gl, n, 0.1, 4.3, 0.2, gl.TEXTURE1, textures[1], samplers[1], 1, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  g_modelMatrix.setTranslate(-39.5, 10.0, 14.0);
  build(gl, n, 0.1, 0.2, 4.8, gl.TEXTURE1, textures[1], samplers[1], 1, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  g_modelMatrix.setTranslate(-39.5, 18.0, 14.0);
  build(gl, n, 0.1, 0.2, 4.8, gl.TEXTURE1, textures[1], samplers[1], 1, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  g_modelMatrix.setTranslate(-39.5, 2.0, 14.0);
  build(gl, n, 0.1, 0.2, 4.8, gl.TEXTURE1, textures[1], samplers[1], 1, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);

  g_modelMatrix.setTranslate(-39.5, 10.0, -4.0);
  build(gl, n, 0.1, 4.3, 0.2, gl.TEXTURE1, textures[1], samplers[1], 1, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  g_modelMatrix.setTranslate(-39.5, 10.0, -14.0);
  build(gl, n, 0.1, 4.0, 0.2, gl.TEXTURE1, textures[1], samplers[1], 1, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  g_modelMatrix.setTranslate(-39.5, 10.0, -24.0);
  build(gl, n, 0.1, 4.3, 0.2, gl.TEXTURE1, textures[1], samplers[1], 1, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  g_modelMatrix.setTranslate(-39.5, 10.0, -14.0);
  build(gl, n, 0.1, 0.2, 4.8, gl.TEXTURE1, textures[1], samplers[1], 1, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  g_modelMatrix.setTranslate(-39.5, 18.0, -14.0);
  build(gl, n, 0.1, 0.2, 4.8, gl.TEXTURE1, textures[1], samplers[1], 1, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  g_modelMatrix.setTranslate(-39.5, 2.0, -14.0);
  build(gl, n, 0.1, 0.2, 4.8, gl.TEXTURE1, textures[1], samplers[1], 1, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);

  //SKY
  g_modelMatrix.setTranslate(-60.0, 10.0, 0.0);
  build(gl, n, 0.1, 10.0, 20.0, gl.TEXTURE0, textures[0], samplers[0], 0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);

//WALL with gap for door
  g_modelMatrix.setTranslate(0.0, 24.0, -40.0);
  build(gl, n, 20.0, 3.0, 0.1, gl.TEXTURE5, textures[5], samplers[5], 5, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  g_modelMatrix.setTranslate(26.0, 4.0, -40.0);
  build(gl, n, 7.0, 7.0, 0.1, gl.TEXTURE5, textures[5], samplers[5], 5, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  g_modelMatrix.setTranslate(-26.0, 4.0, -40.0);
  build(gl, n, 7.0, 7.0, 0.1, gl.TEXTURE5, textures[5], samplers[5], 5, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);

  //DOOR
  g_modelMatrix.setTranslate(12.0, 4.0, -40.0);
  g_modelMatrix.rotate(door_angle, 0.0, 1.0, 0.0);  // Rotate around the y-axis
  g_modelMatrix.translate(-6.0, 0.0, 0.0);
  build(gl, n, 3.0, 7.0, 0.1, gl.TEXTURE2, textures[2], samplers[2], 2, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  g_modelMatrix.translate(-4.0, -2.0, 0.2);
  build(gl, n, 0.5, 0.25, 0.1, gl.TEXTURE1, textures[1], samplers[1], 1, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);

  g_modelMatrix.setTranslate(-12.0, 4.0, -40.0);
  g_modelMatrix.rotate(-door_angle, 0.0, 1.0, 0.0);  // Rotate around the y-axis
  g_modelMatrix.translate(6.0, 0.0, 0.0);
  build(gl, n, 3.0, 7.0, 0.1, gl.TEXTURE2, textures[2], samplers[2], 2, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  g_modelMatrix.translate(4.0, -2.0, 0.2);
  build(gl, n, 0.5, 0.25, 0.1, gl.TEXTURE1, textures[1], samplers[1], 1, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  
  for (var j = 0; j < 2; j++) {//loop for the tables and chairs on the other side
    for (var i = 0; i < 2; i++) {//loop for two table and chairs
      //TABLE
      g_modelMatrix.setTranslate(-30.0 + j*60, -1.0, 10.0 + i*(-25));
      if (j == 0) {
        if (i == 0) {
          g_modelMatrix.translate(0.0, 0.0, table1z);
        } else {
          g_modelMatrix.translate(0.0, 0.0, table2z);
        }
      }
      build(gl, n, 4.5, 0.3, 2.5, gl.TEXTURE1, textures[1], samplers[1], 1, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
      //LEGS
      g_modelMatrix.translate(8.5, -4.6, 4.5);
      build(gl, n, 0.25, 2.2, 0.25, gl.TEXTURE1, textures[1], samplers[1], 1, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
      g_modelMatrix.translate(-17.0, 0.0, 0.0);
      build(gl, n, 0.25, 2.2, 0.25, gl.TEXTURE1, textures[1], samplers[1], 1, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
      g_modelMatrix.translate(0.0, 0.0, -9.0);
      build(gl, n, 0.25, 2.2, 0.25, gl.TEXTURE1, textures[1], samplers[1], 1, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
      g_modelMatrix.translate(17.0, 0.0, 0.0);
      build(gl, n, 0.25, 2.2, 0.25, gl.TEXTURE1, textures[1], samplers[1], 1, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
      //CHAIR
      g_modelMatrix.setTranslate(-30.0 + j*60, -5.0, 6.0 + i*(-25));
      if (j == 0) {
        if (i == 0) {
          g_modelMatrix.translate(0.0, 0.0, chair1z);
        } else {
          g_modelMatrix.translate(0.0, 0.0, chair2z);
        }
      }
      build(gl, n, 2.0, 0.3, 2.0, gl.TEXTURE1, textures[1], samplers[1], 1, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
      //BACK
      g_modelMatrix.translate(0.0, 6.0, -3.5);
      build(gl, n, 2.0, 2.0, 0.3, gl.TEXTURE1, textures[1], samplers[1], 1, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
      //LEGS
      g_modelMatrix.translate(3.4, -7.3, 0.0);
      build(gl, n, 0.3, 1.7, 0.3, gl.TEXTURE1, textures[1], samplers[1], 1, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
      g_modelMatrix.translate(-6.8, 0.0, 0.0);
      build(gl, n, 0.3, 1.7, 0.3, gl.TEXTURE1, textures[1], samplers[1], 1, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
      g_modelMatrix.translate(0.0, -1.0, 6.8);
      build(gl, n, 0.3, 1.2, 0.3, gl.TEXTURE1, textures[1], samplers[1], 1, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
      g_modelMatrix.translate(6.8, 0.0, 0.0);
      build(gl, n, 0.3, 1.2, 0.3, gl.TEXTURE1, textures[1], samplers[1], 1, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
    }
  }
}

var g_matrixStack = []; // Array for storing a matrix
function pushMatrix(m) { // Store the specified matrix to the array
  var m2 = new Matrix4(m);
  g_matrixStack.push(m2);
}

function popMatrix() { // Retrieve the matrix from the array
  return g_matrixStack.pop();
}

function build(gl, n, scale_x, scale_y, scale_z, tex_slot, tex, samp, slot_num, viewProjMatrix, u_MvpMatrix, u_NormalMatrix){
  //this function can build a cuboid of different x, y, z lengths, and bind any of the 6 textures to it
  var u_UseTextures = gl.getUniformLocation(gl.program, "u_UseTextures");
  if (!u_UseTextures) { 
    console.log('Failed to get the storage location for texture map enable flag');
    return;
  }
  pushMatrix(g_modelMatrix);   // Save the model matrix
    g_modelMatrix.scale(scale_x, scale_y, scale_z);
    if (slot_num != -1) {
      gl.activeTexture(tex_slot);
        // Bind the texture object to the target
        gl.bindTexture(gl.TEXTURE_2D, tex);
        // Set the texture image
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, tex.image);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.uniform1i(samp, slot_num);
    }
      // Enable texture 1 if slot_num == 1, texture 2 if slot_num == 2, no texture if slot_num == 0
      gl.uniform1i(u_UseTextures, slot_num+1);

    g_mvpMatrix.set(viewProjMatrix);
    g_mvpMatrix.multiply(g_modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, g_mvpMatrix.elements);
    // Calculate the normal transformation matrix and pass it to u_NormalMatrix
    g_normalMatrix.setInverseOf(g_modelMatrix);
    g_normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, g_normalMatrix.elements);
    // Draw the textured cube
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
  g_modelMatrix = popMatrix();   // Retrieve the model matrix

}



function keydown(ev, gl, n, viewProjMatrix, u_ModelMatrix, u_MvpMatrix, u_NormalMatrix, u_DirectionalToggle, u_Point1Toggle, u_Point2Toggle, u_AmbientToggle, u_background_toggle) {
  //since we must manipulate 2 vectors to apear to move in the x-z plane I use a global angle variable theta, changing this work out the corresponding change in x-z
  var delta_x = Math.cos(theta/180*Math.PI);
  var delta_z = Math.sin(theta/180*Math.PI);
  //these changes must be added to the eye and center vectors 
  switch (ev.keyCode) {
    case 40: // Up arrow key -> FORWARD
      eye_x -= delta_z;
      eye_z += delta_x;
      center_x -= delta_z;
      center_z += delta_x;
      break;
    case 38: // Down arrow key -> BACKWARD
      eye_x += delta_z;
      eye_z -= delta_x;
      center_x += delta_z;
      center_z -= delta_x;
      break;
    case 39: // RIGHT
      eye_x += delta_x;
      eye_z += delta_z;
      center_x += delta_x;
      center_z += delta_z;
      break;
    case 37: // LEFT
      eye_x -= delta_x;
      eye_z -= delta_z;
      center_x -= delta_x;
      center_z -= delta_z;
      break;
    case 68: // d -> ROTATE RIGHT
      //for a rotation we must move the center vector, but not the eye.
      var a = 2*radius*Math.sin(1.5/180*Math.PI);
      //the center must stay the same radius away from the eye
      center_x += a*Math.cos((theta + 1.5)/180*Math.PI);
      center_z += a*Math.sin((theta + 1.5)/180*Math.PI);
      theta += 3;
      break;
    case 65: // a -> ROTATE LEFT
      var a = 2*radius*Math.sin(1.5/180*Math.PI);
      center_x -= a*Math.cos((theta - 1.5)/180*Math.PI);
      center_z -= a*Math.sin((theta - 1.5)/180*Math.PI);
      theta -= 3;
      break;
    case 87: // w <- move up
      eye_y += 1;
      center_y += 1;
      break;
    case 83: // s <- move down
      eye_y -= 1;
      center_y -= 1;
      break;
    case 49: // 1 <- toggle point light source 1
      point1on = point1on != true;
      gl.uniform1i(u_Point1Toggle, point1on);
      break;
    case 50: // 2 <- toggle point light source 2
      point2on = point2on != true;
      gl.uniform1i(u_Point2Toggle, point2on);
      break;
    case 51: // 3 <- toggle directional light
      directionalOn = directionalOn != true;
      gl.uniform1i(u_DirectionalToggle, directionalOn);
      break;
    case 48: // 0 <- toggle ambient light
      ambOn = ambOn != true;
      gl.uniform1i(u_AmbientToggle, ambOn);
      break;
    case 52: // 4 <- toggle ambient light
      background_toggle = background_toggle != true;
      gl.uniform1i(u_background_toggle, background_toggle);
      break;
    case 77://m
      //OPEN DOOR
      if (door_angle < 90.0)  door_angle = (door_angle + 3.0) % 360;
      break;
    case 78://n
      //CLOSE DOOR
      if (door_angle > 0.0)  door_angle = (door_angle - 3.0) % 360;
      break;
    case 90: // z <- move chair 1
      if (chair1z > -5) { chair1z -= 0.2;}
      break;
    case 88: // x
      if (chair1z < 0) { chair1z += 0.2;}
      break;
    case 67: // c <- move table 1
      if (table1z > 0) { table1z -= 0.2;}
      break;
    case 86: // v
      if (table1z < 3) { table1z += 0.2;}
      break;
    case 70: // f <- move chair 2
      if (chair2z > -5) { chair2z -= 0.2;}
      break;
    case 71: // g
      if (chair2z < 0) { chair2z += 0.2;}
      break;
    case 72: // h <- move table 2
      if (table2z > 0) { table2z -= 0.2;}
      break;
    case 74: // j
      if (table2z < 3) { table2z += 0.2;}
      break;
    default: return; // Skip drawing at no effective action
  }
  viewProjMatrix.setPerspective(50.0, canvas.width / canvas.height, 1.0, 100.0);
  viewProjMatrix.lookAt(eye_x, eye_y, eye_z, center_x, center_y, center_z, 0.0, 1.0, 0.0);

  draw(gl, n, viewProjMatrix, u_ModelMatrix, u_MvpMatrix, u_NormalMatrix);
}

function initVertexBuffers(gl) {
  // Create a cube
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3
  // Coordinates
  var vertices = new Float32Array([
     2.0, 2.0, 2.0,  -2.0, 2.0, 2.0,  -2.0,-2.0, 2.0,   2.0,-2.0, 2.0, // v0-v1-v2-v3 front
     2.0, 2.0, 2.0,   2.0,-2.0, 2.0,   2.0,-2.0,-2.0,   2.0, 2.0,-2.0, // v0-v3-v4-v5 right
     2.0, 2.0, 2.0,   2.0, 2.0,-2.0,  -2.0, 2.0,-2.0,  -2.0, 2.0, 2.0, // v0-v5-v6-v1 up
    -2.0, 2.0, 2.0,  -2.0, 2.0,-2.0,  -2.0,-2.0,-2.0,  -2.0,-2.0, 2.0, // v1-v6-v7-v2 left
    -2.0,-2.0,-2.0,   2.0,-2.0,-2.0,   2.0,-2.0, 2.0,  -2.0,-2.0, 2.0, // v7-v4-v3-v2 down
     2.0,-2.0,-2.0,  -2.0,-2.0,-2.0,  -2.0, 2.0,-2.0,   2.0, 2.0,-2.0  // v4-v7-v6-v5 back
  ]);
  ////Colors
  var colors = new Float32Array([
    1, 1, 1,   1, 1, 1,   1, 1, 1,  1, 1, 1,     // v1-v1-v2-v3 front
    1, 1, 1,   1, 1, 1,   1, 1, 1,  1, 1, 1,     // v1-v3-v4-v5 right
    1, 1, 1,   1, 1, 1,   1, 1, 1,  1, 1, 1,     // v1-v5-v6-v1 up
    1, 1, 1,   1, 1, 1,   1, 1, 1,  1, 1, 1,     // v1-v6-v7-v2 left
    1, 1, 1,   1, 1, 1,   1, 1, 1,  1, 1, 1,     // v7-v4-v3-v2 down
    1, 1, 1,   1, 1, 1,   1, 1, 1,  1, 1, 1　    // v4-v7-v6-v5 back
 ]);
  ////Normal
  var normals = new Float32Array([
    0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
    1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
    0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
   -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
    0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
    0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
  ]);
  ////Texture Coordinates
  var texCoords = new Float32Array([
    1.0, 1.0,    0.0, 1.0,   0.0, 0.0,   1.0, 0.0,  // v0-v1-v2-v3 front
    0.0, 1.0,    0.0, 0.0,   1.0, 0.0,   1.0, 1.0,  // v0-v3-v4-v5 right
    1.0, 0.0,    1.0, 1.0,   0.0, 1.0,   0.0, 0.0,  // v0-v5-v6-v1 up
    1.0, 1.0,    0.0, 1.0,   0.0, 0.0,   1.0, 0.0,  // v1-v6-v7-v2 left
    0.0, 0.0,    1.0, 0.0,   1.0, 1.0,   0.0, 1.0,  // v7-v4-v3-v2 down
    0.0, 0.0,    1.0, 0.0,   1.0, 1.0,   0.0, 1.0   // v4-v7-v6-v5 back
  ]);
  ////Indices of the vertices
  var indices = new Uint8Array([
     0, 1, 2,   0, 2, 3,    // front
     4, 5, 6,   4, 6, 7,    // right
     8, 9,10,   8,10,11,    // up
    12,13,14,  12,14,15,    // left
    16,17,18,  16,18,19,    // down
    20,21,22,  20,22,23     // back
 ]);
 // var vertices = new Float32Array([
 //     2.0, 2.0, 2.0,  -2.0, 2.0, 2.0,  -2.0,-2.0, 2.0,   2.0,-2.0, 2.0, // v0-v1-v2-v3 front
 //     2.0,-2.0,-2.0,   2.0, 2.0,-2.0,  -2.0, 2.0,-2.0,  -2.0,-2.0,-2.0, // v4-v5-v6-v7 up
 //  ]);
 //    var colors = new Float32Array([
 //    1, 1, 1,   1, 1, 1,   1, 1, 1,  1, 1, 1,     // v1-v1-v2-v3 front
 //    1, 1, 1,   1, 1, 1,   1, 1, 1,  1, 1, 1,     // v1-v3-v4-v5 right
 // ]);
 //    var normals = new Float32Array([
 //    0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
 //    0.0, 0.0,-1.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 0.0,-1.0,  // v4-v5-v6-v7 right
 //  ]);
 //    var texCoords = new Float32Array([
 //    1.0, 1.0,    0.0, 1.0,   0.0, 0.0,   1.0, 0.0,  // v0-v1-v2-v3 
 //    1.0, 0.0,    1.0, 1.0,   0.0, 1.0,   0.0, 0.0,  // v4-v5-v6-v7 
 //  ]);
 //   var indices = new Uint8Array([
 //     0, 1, 2,   0, 2, 3,    // front
 //     0, 3, 4,   0, 4, 5,    // right
 //     0, 5,6,   0,6,1,    // up
 //     1,6,7,  1,7,2,    // left
 //     7,4,3,  7,3,2,    // down
 //     4,7,6,  4,6,5     // back
 // ]);
  // Write the vertex property to buffers (coordinates, colors and normals)
  if (!initArrayBuffer(gl, 'a_Position', vertices, 3)) return -1;
  if (!initArrayBuffer(gl, 'a_Color', colors, 3)) return -1;
  if (!initArrayBuffer(gl, 'a_Normal', normals, 3)) return -1;
  if (!initArrayBuffer(gl, 'a_TexCoords', texCoords, 2)) return -1;


  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // Write the indices to the buffer object
  var indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  return indices.length;
}

function initArrayBuffer(gl, attribute, data, num) {
  // Create a buffer object
  var buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  
  // Element size
  var FSIZE = data.BYTES_PER_ELEMENT;

  // Assign the buffer object to the attribute variable

  var a_attribute = gl.getAttribLocation(gl.program, attribute);
  if (a_attribute < 0) {
    console.log('Failed to get the storage location of ' + attribute);
    return false;
  }
  gl.vertexAttribPointer(a_attribute, num, gl.FLOAT, false, FSIZE * num, 0);
  // Enable the assignment of the buffer object to the attribute variable
  gl.enableVertexAttribArray(a_attribute);

  return true;
}

