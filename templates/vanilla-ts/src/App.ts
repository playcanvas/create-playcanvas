import { DEVICETYPE_WEBGL2, createGraphicsDevice, AppBase, AppOptions, RenderComponentSystem, CameraComponentSystem, LightComponentSystem, TextureHandler, ContainerHandler, FILLMODE_FILL_WINDOW, RESOLUTION_AUTO, Entity, Color, ScriptComponent, ScriptComponentSystem, Vec3, Picker, EVENT_MOUSEDOWN, EVENT_TOUCHSTART, TouchDevice, Mouse, Mesh, MeshInstance, EVENT_MOUSEMOVE, StandardMaterial, Layer, EVENT_MOUSEUP } from 'playcanvas';

// @ts-expect-error No declaration exists for this script
import { Grid } from 'playcanvas/scripts/esm/grid.mjs';

// @ts-expect-error No declaration exists for this script
import { CameraControls } from 'playcanvas/scripts/esm/camera-controls.mjs';
import { throttle } from './utils';

/**
 * Setup the PlayCanvas app
 * @param canvas - The canvas element
 * @param onClick - The function to call when the user clicks on the sphere
 */
async function setupApp(canvas: HTMLCanvasElement, onClick: () => void) {

  if (!canvas) {
      throw new Error('Canvas not found');
  }

  // create graphics device
  const device = await createGraphicsDevice(canvas, {
    deviceTypes: [DEVICETYPE_WEBGL2],
  });

  // create app options
  const createOptions = new AppOptions();
  createOptions.graphicsDevice = device;
  createOptions.mouse = new Mouse(document.body);
  createOptions.touch = new TouchDevice(document.body);
  createOptions.componentSystems = [RenderComponentSystem, CameraComponentSystem, LightComponentSystem, ScriptComponentSystem];
  createOptions.resourceHandlers = [TextureHandler, ContainerHandler];

  // create app
  const app = new AppBase(canvas);
  app.init(createOptions);
  app.start();

  // Set the canvas to fill the window and a
  app.setCanvasFillMode(FILLMODE_FILL_WINDOW);
  app.setCanvasResolution(RESOLUTION_AUTO);

  // Ensure canvas is resized when window changes size
  const resize = () => app.resizeCanvas();
  window.addEventListener('resize', resize);

  app.on('destroy', () => {
      window.removeEventListener('resize', resize);
  });

  // create sphere entity
  const sphere = new Entity('sphere');
  sphere.setLocalScale(4, 4, 4);
  sphere.setPosition(new Vec3(0, 2, 0));
  sphere.addComponent('render', {
      type: 'sphere'
  });
  app.root.addChild(sphere);

  // create camera entity
  const camera = new Entity('camera');
  camera.addComponent('camera', {
    clearColor: new Color(0.09, 0.09, 0.09)
  });
  app.root.addChild(camera);
  camera.setPosition(new Vec3(8, 2, 8));

  // create camera controls
  camera.addComponent('script');
  const controls = camera.script?.create(CameraControls) as CameraControls;
  controls.focusPoint = sphere.getLocalPosition();
  controls.sceneSize = new Vec3(2, 2, 2).length();
  controls.enableFly = false;
  controls.lookSpeed = 0.001;
  
  // create grid entity
  const grid = new Entity('grid');
  grid.addComponent('script');
  grid.script?.create(Grid);
  app.root.addChild(grid);
  grid.setLocalScale(1000, 1000, 1000);

  // create directional light entity
  const light = new Entity('light');
  light.addComponent('light');
  app.root.addChild(light);
  light.setEulerAngles(45, 0, 0);

  // create a picker
  const picker = new Picker(app, 1, 1);

  // function handling mouse click / touch
  const worldLayer = app.scene.layers.getLayerByName('World');
  const intersectsSphere = (x: number, y: number, layer: Layer) : Promise<boolean> => {

    if (!camera.camera) {
      return Promise.resolve(false);
    }

    const pickerScale = 0.5;
    picker.resize(canvas.clientWidth * pickerScale, canvas.clientHeight * pickerScale);

    if (!layer) {
      return Promise.resolve(false);
    }
    
    // render the ID texture
    picker.prepare(camera.camera, app.scene, [layer]);

    // get the meshInstance of the picked object
    return picker.getSelectionAsync(x * pickerScale, y * pickerScale, 1, 1).then((meshInstances: MeshInstance[]) : boolean => {
      if (meshInstances.length === 0) return false;
      return meshInstances[0] === sphere.render?.meshInstances[0];
    });
  };

  app.mouse?.on(EVENT_MOUSEDOWN, (event) => {
    if (!worldLayer) return;
    intersectsSphere(event.x, event.y, worldLayer);
  });

  const HOVER_COLOR = new Color(1, 0, 0);
  const DEFAULT_COLOR = new Color(1, 1, 1);
  const material = sphere.render?.material as StandardMaterial;


  // on mouse move, check if the user is hovering over the sphere and update the cursor
  app.mouse?.on(EVENT_MOUSEMOVE, throttle((event) => {
    if (!worldLayer) return;
    intersectsSphere(event.x, event.y, worldLayer).then((intersects) => {
      material.diffuse.copy(intersects ? HOVER_COLOR : DEFAULT_COLOR);
      document.body.style.cursor = intersects ? 'pointer' : 'default';
      material.update();
    });
  }, 100));

  // on mouse up, check if the user clicked on the sphere and call the onClick function
  app.mouse?.on(EVENT_MOUSEUP, (event) => {
    if (!worldLayer || !onClick) return;
    intersectsSphere(event.x, event.y, worldLayer).then((intersects) => {
      if (intersects) {
        onClick();
      }
    })
  });

}

export { setupApp };
