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
  };

  app.updateSize();
  window.addEventListener('resize', app.updateSize);
  return app;
}

const app = initApp();
