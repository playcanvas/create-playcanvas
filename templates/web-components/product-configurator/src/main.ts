import type { AssetElement, EntityElement, ModelElement } from '@playcanvas/web-components';
import { whenReady } from '@playcanvas/web-components';
import type { RenderComponent } from 'playcanvas';
import { Color, CylinderGeometry, Mesh, MeshInstance, StandardMaterial, Vec2, Vec3 } from 'playcanvas';
import { CameraControls } from 'playcanvas/scripts/esm/camera-controls.mjs';
import { ProceduralSky } from 'playcanvas/scripts/esm/sky/procedural-sky.mjs';

import './product.css';
import './starter.css';

const CAMERA_FOCUS = new Vec3(0, 0.8, 0);
const CAMERA_PITCH = new Vec2(-85, -4);

const [cameraComponent, , model, sky, groundElement] = await Promise.all([
    whenReady('pc-camera'),
    whenReady<AssetElement>('#car'),
    whenReady<ModelElement>('pc-model'),
    whenReady<EntityElement>('pc-entity[name="sky"]'),
    whenReady<EntityElement>('pc-entity[name="studio-ground"]')
]);

const camera = cameraComponent.closestEntity!.entity!;
const app = camera.camera!.system.app;
camera.camera!.requestSceneColorMap(true);
camera.addComponent('script');
camera.script!.create(CameraControls, {
    properties: {
        sceneSize: 6.2,
        focusPoint: CAMERA_FOCUS,
        pitchRange: CAMERA_PITCH,
        enableFly: false,
        enablePan: false
    }
});

sky.entity!.addComponent('script');
sky.entity!.script!.create(ProceduralSky, { properties: { luminance: 0.18 } });

const podium = new StandardMaterial();
podium.diffuse = new Color(0.3, 0.32, 0.34);
podium.metalness = 0.15;
podium.gloss = 0.65;
podium.update();

const ground = groundElement.entity!;
ground.setPosition(0, -0.08, 0);
ground.addComponent('render', {
    meshInstances: [
        new MeshInstance(
            Mesh.fromGeometry(
                app.graphicsDevice,
                new CylinderGeometry({ radius: 4, height: 0.16, heightSegments: 1, capSegments: 128 })
            ),
            podium
        )
    ],
    castShadows: false,
    receiveShadows: true
});

const entity = model.entity!;
entity.setLocalEulerAngles(-90, -25, 0);
entity.root.syncHierarchy();
const meshes = (entity.findComponents('render') as RenderComponent[]).flatMap((render) => render.meshInstances);
const bounds = meshes[0].aabb.clone();
meshes.slice(1).forEach((mesh) => bounds.add(mesh.aabb));
const scale = 5 / Math.max(bounds.halfExtents.x * 2, bounds.halfExtents.z * 2);
entity.setLocalScale(scale, scale, scale);
entity.root.syncHierarchy();
bounds.copy(meshes[0].aabb);
meshes.slice(1).forEach((mesh) => bounds.add(mesh.aabb));
entity.setPosition(-bounds.center.x, 0.03 - bounds.getMin().y, -bounds.center.z);

const body = meshes.filter((mesh) => mesh.material.name === 'material');
const panels = meshes.filter((mesh) => mesh.material.name === 'material_1');
const paint = body[0].material.clone() as StandardMaterial;
const shade = panels[0].material.clone() as StandardMaterial;
body.forEach((mesh) => (mesh.material = paint));
panels.forEach((mesh) => (mesh.material = shade));
paint.diffuse.fromString('#d6293e');
shade.diffuse.fromString('#9b1731');
paint.update();
shade.update();

document.querySelectorAll<HTMLButtonElement>('#paints button').forEach((button, i, buttons) => {
    button.onclick = () => {
        paint.diffuse.fromString(button.dataset.color!);
        shade.diffuse.fromString(button.dataset.shade!);
        paint.update();
        shade.update();
        buttons.forEach((item, j) => (item.ariaPressed = String(i === j)));
    };
});
