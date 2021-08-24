//gl context initilized
const canvas = document.getElementById('gl-canvas');
const gl = canvas.getContext('webgl2');



//Shader para posiciones
const vertexShader = `#version 300 es
precision mediump float;

in vec2 position;
in vec3 iColor;
out vec3 oColor;
uniform float iTime;
uniform mat4 modelMatrix;

void main()
{
    gl_Position = modelMatrix * vec4(position, 0, 1);
    oColor = vec3(abs(sin(iTime)), iColor.gb);
}
`;

//shader para color
const fragmentShader = `#version 300 es
precision mediump float;

out vec4 fragColor;
in vec3 oColor;

void main()
{
    fragColor = vec4(oColor, 1);
}
`;

const vs = gl.createShader(gl.VERTEX_SHADER);
const fs = gl.createShader(gl.FRAGMENT_SHADER);

gl.shaderSource(vs, vertexShader);
gl.shaderSource(fs, fragmentShader);

gl.compileShader(vs);
gl.compileShader(fs);

if(!gl.getShaderParameter(vs, gl.COMPILE_STATUS)){
    console.error(gl.getShaderInfoLog(vs));
}
if(!gl.getShaderParameter(fs, gl.COMPILE_STATUS)){
    console.error(gl.getShaderInfoLog(fs));
}

const program = gl.createProgram();
gl.attachShader(program, vs);
gl.attachShader(program, fs);
gl.linkProgram(program);

if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
    console.error(gl.getProgramInfoLog(program));
}

gl.useProgram(program);

//Drawing basic triangle
const triangleCoords = [
    -0.2, 0.2,
    -0.2, -0.2,
    0.2, -0.2,

    -0.2, 0.2,
    0.2, -0.2,
    0.2, 0.2
];

const vertexColorArray = [
    1, 0, 0, //r
    0, 1, 0, //g
    0, 0, 1, //b

    1, 1, 0,
    0.5, 0, 0.5,
    0, 1, 0.5
];

/* const indexArray = [
    0, 1, 2,
    0, 2, 3
]; */

//const indexArrayBuffer = gl.createBuffer();
const vertexColorBuffer = gl.createBuffer();
const positionBuffer = gl.createBuffer();

const now = Date.now();

const uniformTime = gl.getUniformLocation(program, 'iTime');
const uModelMatrix = gl.getUniformLocation(program, 'modelMatrix');

const modelMatrix = mat4.create();

const update = ()=> {
    
    //gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexArrayBuffer);

    const deltaTime = Date.now() - now;
    //console.log(deltaTime);

    mat4.rotate(
        modelMatrix,
        modelMatrix,
        deltaTime * 3.0,
        [0, 0, 1]
    );

    //clear screen
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    
    gl.uniform1f(uniformTime, deltaTime / 1000);

    gl.uniformMatrix4fv(uModelMatrix, false, modelMatrix);

    //
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColorArray), gl.STATIC_DRAW);
    const attribVertexColor = gl.getAttribLocation(program, 'iColor');
    gl.enableVertexAttribArray(attribVertexColor);
    gl.vertexAttribPointer(attribVertexColor, 3, gl.FLOAT, gl.FALSE, 0, 0);

    //Reservamos memoria en la tarjeta de video (Vram)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleCoords), gl.STATIC_DRAW);
    const attribPosition = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(attribPosition);
    gl.vertexAttribPointer(attribPosition, 2, gl.FLOAT, gl.FALSE, 0, 0);

    //gl.drawElements(gl.GL_TRIANGLE, 6, gl.UNSIGNED_SHORT, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(update);
}

requestAnimationFrame(update);