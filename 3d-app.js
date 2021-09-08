//gl context initilized
const canvas = document.getElementById('gl-canvas');
const gl = canvas.getContext('webgl2');



//Shader para posiciones
const vertexShader = `#version 300 es
precision mediump float;

in vec3 position;
in vec3 iColor;
out vec3 oColor;
uniform float iTime;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

void main()
{
    gl_Position = projectionMatrix * viewMatrix * (modelMatrix * vec4(position, 1));
    oColor = iColor;
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

//Cube vertices
const cubeCoords = [
    -1,-1,-1, 1,-1,-1, 1,1,-1, -1,1,-1, //front quad
    -1,-1,1, 1,-1,1, 1,1,1, -1,1,1, //back quad
    -1,-1,-1, -1,-1,1, -1,1,1, -1,1,-1, //left quad
     1,-1,-1, 1,-1,1, 1,1,1, 1,1,-1, //right quad
    -1,-1,-1, -1,-1,1, 1,-1,1, 1,-1,-1, //down quad
    -1,1,-1, -1,1,1, 1,1,1, 1,1,-1, //up quad
];

const vertexColorArray = [
    1,0,0, 1,0,0, 1,0,0, 1,0,0, //front quad color
    0,1,0, 0,1,0, 0,1,0, 0,1,0, //back quad color
    0,0,1, 0,0,1, 0,0,1, 0,0,1, //left quad color
    1,1,0, 1,1,0, 1,1,0, 1,1,0, //right quad color
    0,1,1, 0,1,1, 0,1,1, 0,1,1, //down quad color
    1,0,1, 1,0,1, 1,0,1, 1,0,1, //up quad color
];

const indexArray = [
    0,1,2, 0,2,3, //front quad indices
    4,5,6, 4,6,7, //back quad indices
    8,9,10, 8,10,11, //left quad indices
    12,13,14, 12,14,15, //right quad indices
    16,17,18, 16,18,19, //down quad indices
    20,21,22, 20,22,23, //up quad indices
];

const indexArrayBuffer = gl.createBuffer();
const vertexColorBuffer = gl.createBuffer();
const positionBuffer = gl.createBuffer();

let now = Date.now();

const uniformTime = gl.getUniformLocation(program, 'iTime');
const uModelMatrix = gl.getUniformLocation(program, 'modelMatrix');
const uViewMatrix = gl.getUniformLocation(program, 'viewMatrix');
const uProjectionMatrix = gl.getUniformLocation(program, 'projectionMatrix');
const attribVertexColor = gl.getAttribLocation(program, 'iColor');
const attribPosition = gl.getAttribLocation(program, 'position');

const modelMatrix = mat4.create();
const viewMatrix = mat4.create();
const projectionMatrix = mat4.create();

const axis = {
    x:0,
    y:0
};

const ArrowKeys = ()=>{
    addEventListener('keydown', ({key}) => {
        console.log(key);
        axis.x = key === 'a' ? -1 : key === 'd' ? 1 : 0;
        axis.y = key === 's' ? -1 : key === 'w' ? 1 : 0;
        //console.log(axis);
    });
    addEventListener('keyup', ({key}) => {
        console.log(key);
        axis.x = (key === 'a' || key === 'd') ? 0 : axis.x;
        axis.y = (key === 's' || key === 'w') ? 0 : axis.y;
        //console.log(axis);
    });
};



ArrowKeys();

mat4.scale(
    modelMatrix,
    modelMatrix,
    [1, 1, 1]
);

mat4.translate(
    modelMatrix,
    modelMatrix,
    [0, 0, -10]
);



const update = ()=> {
    //gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexArrayBuffer);

    const deltaTime = (Date.now() - now) / 1000;
    now = Date.now();
    //console.log(deltaTime/1000);

    mat4.rotate(
        modelMatrix,
        modelMatrix,
        deltaTime * 1,
        [1, 1, 0]
    );

    mat4.translate(
        modelMatrix,
        modelMatrix,
        [axis.x * deltaTime, axis.y * deltaTime, 0]
    );
    
    
    mat4.perspective(
        projectionMatrix,
        45 * (Math.PI / 180),
        canvas.clientWidth / canvas.clientHeight,
        1,
        1000
    );
    

    //clear screen
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    
    gl.uniform1f(uniformTime, deltaTime / 1000);

    gl.uniformMatrix4fv(uModelMatrix, false, modelMatrix);
    gl.uniformMatrix4fv(uViewMatrix, false, viewMatrix);
    gl.uniformMatrix4fv(uProjectionMatrix, false, projectionMatrix);

    //Color
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColorArray), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(attribVertexColor);
    gl.vertexAttribPointer(attribVertexColor, 3, gl.FLOAT, gl.FALSE, 0, 0);

    //Reservamos memoria en la tarjeta de video (Vram)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeCoords), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(attribPosition);
    gl.vertexAttribPointer(attribPosition, 3, gl.FLOAT, gl.FALSE, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexArrayBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexArray), gl.STATIC_DRAW);

    gl.drawElements(gl.TRIANGLES, indexArray.length, gl.UNSIGNED_SHORT, 0);
    //gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(update);
};

requestAnimationFrame(update);