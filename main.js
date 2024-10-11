function initApp() {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2');

  if (!gl) {
    throw new Error('WebGL2 not supported');
  }

  document.body.appendChild(canvas);

  const app = {
    canvas,
    gl,
    glSize: { w: 0, h: 0 },
    dpr: Math.min(window.devicePixelRatio, 2),
    updateSize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.glSize = { w: w * this.dpr, h: h * this.dpr };

      this.canvas.width = this.glSize.w;
      this.canvas.height = this.glSize.h;
      this.canvas.style.width = `${w}px`;
      this.canvas.style.height = `${h}px`;

      this.gl.viewport(0, 0, this.glSize.w, this.glSize.h);
    },
    createShader(type, source) {
      const shader = this.gl.createShader(type);
      if (!shader) {
        console.error('Failed to create shader');
        return null;
      }
      this.gl.shaderSource(shader, source);
      this.gl.compileShader(shader);
      if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', this.gl.getShaderInfoLog(shader));
        this.gl.deleteShader(shader);
        return null;
      }
      return shader;
    },
    createProgram(vertexShader, fragmentShader) {
      const program = this.gl.createProgram();
      if (!program) {
        console.error('Failed to create program');
        return null;
      }
      this.gl.attachShader(program, vertexShader);
      this.gl.attachShader(program, fragmentShader);
      this.gl.linkProgram(program);
      if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
        console.error('Program link error:', this.gl.getProgramInfoLog(program));
        this.gl.deleteProgram(program);
        return null;
      }
      return program;
    },
    initShaders() {
      const vertexShaderSource = `#version 300 es
        in vec4 a_position;
        out vec4 pos;
        void main() {
          gl_Position = a_position;
          pos = gl_Position;
        }
      `;
      const fragmentShaderSource = `#version 300 es
        #ifdef GL_ES
        precision mediump float;
        #endif
        uniform float u_time;
        in vec4 pos;
        out vec4 fragColor;
        void main() {
        float x = 1.0;
        x = (sin(u_time)+1.0)/2.0;
        if(sqrt(pos.y*pos.y+pos.x*pos.x) > (x-0.002) && sqrt(pos.y*pos.y+pos.x*pos.x) < x){
            fragColor = vec4(1, .0, .0, 1.0);
          }else{
            fragColor = vec4(x-sin(u_time)*sqrt(pos.y*pos.y+pos.x*pos.x), .0, .0, 1.0);
          }
          if(sqrt(pos.y*pos.y+pos.x*pos.x) > x){
          fragColor = vec4(.0, .0, .0, 1.0);
          }
        }

      `;

      const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
      const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);

      if (!vertexShader || !fragmentShader) {
        throw new Error('Failed to create shaders');
      }

      this.program = this.createProgram(vertexShader, fragmentShader);
      if (!this.program) {
        throw new Error('Failed to create program');
      }

      this.gl.useProgram(this.program);

      const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
      const positionBuffer = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);

      const positionAttributeLocation = this.gl.getAttribLocation(this.program, 'a_position');
      this.gl.enableVertexAttribArray(positionAttributeLocation);
      this.gl.vertexAttribPointer(positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);

      this.timeUniformLocation = this.gl.getUniformLocation(this.program, 'u_time');
    },
    render(time) {
      if (this.timeUniformLocation) {
        this.gl.uniform1f(this.timeUniformLocation, time * 0.001);
      }
      this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
      requestAnimationFrame(this.render.bind(this));
    },
  };

  app.updateSize();
  window.addEventListener('resize', app.updateSize.bind(app));
  app.initShaders();
  requestAnimationFrame(app.render.bind(app));
  return app;
}

const app = initApp();
