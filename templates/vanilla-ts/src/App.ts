import {
  createGraphicsDevice,
  AppBase,
  AppOptions,
  RenderComponentSystem,
  CameraComponentSystem,
  ScriptComponentSystem,
  TextureHandler,
  ContainerHandler,
  FILLMODE_FILL_WINDOW,
  RESOLUTION_AUTO,
  Entity,
  Color,
  Vec3,
  Picker,
  EVENT_MOUSEMOVE,
  EVENT_MOUSEUP,
  TouchDevice,
  Mouse,
  MeshInstance,
  StandardMaterial,
  Layer,
  Asset,
  AssetListLoader,
  TEXTURETYPE_RGBP
} from 'playcanvas';

// @ts-expect-error - PlayCanvas ESM scripts don't have type declarations
import { Grid } from 'playcanvas/scripts/esm/grid.mjs';

// @ts-expect-error - PlayCanvas ESM scripts don't have type declarations
import { CameraControls } from 'playcanvas/scripts/esm/camera-controls.mjs';

import { throttle } from './utils';

const HOVER_COLOR = new Color(1, 0.647, 0);
const DEFAULT_COLOR = new Color(0.827, 0.827, 0.827);

// Assets to load
const assets = {
  envAtlas: new Asset('env-atlas', 'texture', { url: '/environment-map.png' }, {
    type: TEXTURETYPE_RGBP,
    mipmaps: false
  })
};

/**
 * Setup the PlayCanvas app
 * @param canvas - The canvas element
 * @param onClick - The function to call when the user clicks on the sphere
 */
async function setupApp(canvas: HTMLCanvasElement, onClick: () => void) {

  if (!canvas) {
    throw new Error('Canvas not found');
  }

  // Create graphics device
  const device = await createGraphicsDevice(canvas);

  // Create app options
  const createOptions = new AppOptions();
  createOptions.graphicsDevice = device;
  createOptions.mouse = new Mouse(document.body);
  createOptions.touch = new TouchDevice(document.body);
  createOptions.componentSystems = [
    RenderComponentSystem,
    CameraComponentSystem,
    ScriptComponentSystem
  ];
  createOptions.resourceHandlers = [TextureHandler, ContainerHandler];

  // Create app
  const app = new AppBase(canvas);
  app.init(createOptions);

  // Set the canvas to fill the window
  app.setCanvasFillMode(FILLMODE_FILL_WINDOW);
  app.setCanvasResolution(RESOLUTION_AUTO);

  // Ensure canvas is resized when window changes size
  const resize = () => app.resizeCanvas();
  window.addEventListener('resize', resize);

  app.once('destroy', () => {
    window.removeEventListener('resize', resize);
  });

  // Load assets
  await new Promise<void>((resolve) => {
    new AssetListLoader(Object.values(assets), app.assets).load(() => resolve());
  });

  app.start();

  // Set up environment lighting (no skybox, just IBL)
  app.scene.envAtlas = assets.envAtlas.resource;
  const skyboxLayer = app.scene.layers.getLayerByName('Skybox');
  if (skyboxLayer) {
    skyboxLayer.enabled = false;
  }

  // Create sphere entity
  const sphere = new Entity('sphere');
  sphere.setPosition(new Vec3(0, 0.5, 0));

  // Create a new material
  const material = new StandardMaterial();
  material.diffuse.copy(DEFAULT_COLOR);
  material.update();

  sphere.addComponent('render', {
    type: 'sphere',
    material: material
  });
  app.root.addChild(sphere);

  // Create camera entity
  const camera = new Entity('camera');
  camera.addComponent('camera', {
    clearColor: new Color(0.09, 0.09, 0.09)
  });
  camera.setPosition(new Vec3(4, 1, 4));
  app.root.addChild(camera);

  // Create camera controls
  camera.addComponent('script');
  camera.script?.create(CameraControls);

  // Create grid entity
  const grid = new Entity('grid');
  grid.addComponent('script');
  grid.script?.create(Grid);
  grid.setLocalScale(1000, 1000, 1000);
  app.root.addChild(grid);

  // Create a picker for mouse interaction
  const picker = new Picker(app, 1, 1);
  const worldLayer = app.scene.layers.getLayerByName('World');

  const intersectsSphere = (x: number, y: number, layer: Layer): Promise<boolean> => {
    if (!camera.camera) {
      return Promise.resolve(false);
    }

    const pickerScale = 0.5;
    picker.resize(canvas.clientWidth * pickerScale, canvas.clientHeight * pickerScale);

    if (!layer) {
      return Promise.resolve(false);
    }

    picker.prepare(camera.camera, app.scene, [layer]);

    return picker.getSelectionAsync(x * pickerScale, y * pickerScale, 1, 1).then((meshInstances: MeshInstance[]): boolean => {
      if (meshInstances.length === 0) return false;
      return meshInstances[0] === sphere.render?.meshInstances[0];
    });
  };

  // On mouse move, check if hovering over sphere and update cursor/color
  app.mouse?.on(EVENT_MOUSEMOVE, throttle((event) => {
    if (!worldLayer) return;
    intersectsSphere(event.x, event.y, worldLayer).then((intersects) => {
      material.diffuse.copy(intersects ? HOVER_COLOR : DEFAULT_COLOR);
      document.body.style.cursor = intersects ? 'pointer' : 'default';
      material.update();
    });
  }, 100));

  // On mouse up, check if clicked on sphere and call onClick
  app.mouse?.on(EVENT_MOUSEUP, (event) => {
    if (!worldLayer || !onClick) return;
    intersectsSphere(event.x, event.y, worldLayer).then((intersects) => {
      if (intersects) {
        onClick();
      }
    });
  });
}

export { setupApp };
