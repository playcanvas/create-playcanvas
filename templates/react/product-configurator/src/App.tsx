import { Application, Entity } from '@playcanvas/react';
import { Camera, Light, Script } from '@playcanvas/react/components';
import { useApp, useModel } from '@playcanvas/react/hooks';
import type { ContainerResource, Entity as PcEntity, RenderComponent } from 'playcanvas';
import { Color, CylinderGeometry, Mesh, MeshInstance, StandardMaterial, TONEMAP_ACES2, Vec2, Vec3 } from 'playcanvas';
import { CameraControls } from 'playcanvas/scripts/esm/camera-controls.mjs';
import { ProceduralSky } from 'playcanvas/scripts/esm/sky/procedural-sky.mjs';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import './product.css';
import './starter.css';

const PRODUCT_URL = 'https://developer.playcanvas.com/assets/lambo.glb';
const PAINTS = [
    { name: 'Crimson', color: '#d6293e', shade: '#9b1731' },
    { name: 'Arctic', color: '#d8e4e9', shade: '#8fa8b5' },
    { name: 'Volt', color: '#9acb34', shade: '#3c742d' }
];
const CAMERA_FOCUS = new Vec3(0, 0.8, 0);
const CAMERA_PITCH = new Vec2(-85, -4);

function Product({ color, shade }: { color: string; shade: string }) {
    const { asset } = useModel(PRODUCT_URL);
    const root = useRef<PcEntity>(null);
    const paint = useRef<StandardMaterial>(null);
    const tone = useRef<StandardMaterial>(null);
    const resource = asset?.resource as ContainerResource | undefined;

    useLayoutEffect(() => {
        if (!resource || !root.current) return;
        const entity = resource.instantiateRenderEntity();
        entity.setLocalEulerAngles(-90, -25, 0);
        root.current.addChild(entity);

        const meshes = (entity.findComponents('render') as RenderComponent[]).flatMap((render) => render.meshInstances);
        const bounds = meshes[0].aabb.clone();
        meshes.slice(1).forEach((mesh) => bounds.add(mesh.aabb));
        const scale = 5 / Math.max(bounds.halfExtents.x * 2, bounds.halfExtents.z * 2);
        entity.setLocalScale(scale, scale, scale);
        root.current.root.syncHierarchy();
        bounds.copy(meshes[0].aabb);
        meshes.slice(1).forEach((mesh) => bounds.add(mesh.aabb));
        entity.setPosition(-bounds.center.x, 0.03 - bounds.getMin().y, -bounds.center.z);

        const body = meshes.filter((mesh) => mesh.material.name === 'material');
        const panels = meshes.filter((mesh) => mesh.material.name === 'material_1');
        paint.current = body[0].material.clone() as StandardMaterial;
        tone.current = panels[0].material.clone() as StandardMaterial;
        body.forEach((mesh) => (mesh.material = paint.current!));
        panels.forEach((mesh) => (mesh.material = tone.current!));
        return () => {
            paint.current?.destroy();
            tone.current?.destroy();
            paint.current = null;
            tone.current = null;
            entity.destroy();
        };
    }, [resource]);

    useLayoutEffect(() => {
        if (!paint.current) return;
        paint.current.diffuse.fromString(color);
        tone.current!.diffuse.fromString(shade);
        paint.current.update();
        tone.current!.update();
    }, [color, shade, resource]);

    return <Entity ref={root} name="car" />;
}

function Studio() {
    const app = useApp();
    const ground = useRef<PcEntity>(null);

    useEffect(() => {
        const entity = ground.current;
        if (!entity) return;

        const podium = new StandardMaterial();
        podium.diffuse = new Color(0.12, 0.18, 0.24);
        podium.metalness = 0.15;
        podium.gloss = 0.65;
        podium.update();
        const cylinder = Mesh.fromGeometry(
            app.graphicsDevice,
            new CylinderGeometry({ radius: 4, height: 0.16, heightSegments: 1, capSegments: 128 })
        );
        entity.setPosition(0, -0.08, 0);
        entity.addComponent('render', {
            meshInstances: [new MeshInstance(cylinder, podium)],
            castShadows: false,
            receiveShadows: true
        });

        return () => {
            if (entity.render) entity.removeComponent('render');
            cylinder.destroy();
            podium.destroy();
        };
    }, [app]);

    return <Entity ref={ground} name="studio-ground" />;
}

function Scene({ color, shade }: { color: string; shade: string }) {
    return (
        <>
            <Entity name="sky">
                <Script script={ProceduralSky} luminance={0.18} />
            </Entity>
            <Entity name="camera" position={[5.5, 3.2, 6.5]} rotation={[-16, 40, 0]}>
                <Camera fov={40} toneMapping={TONEMAP_ACES2} renderSceneColorMap />
                <Script
                    script={CameraControls}
                    sceneSize={6.2}
                    focusPoint={CAMERA_FOCUS}
                    pitchRange={CAMERA_PITCH}
                    enableFly={false}
                    enablePan={false}
                />
            </Entity>
            <Entity name="light" rotation={[45, 35, 0]}>
                <Light type="directional" intensity={2.5} castShadows shadowBias={0.2} normalOffsetBias={0.05} />
            </Entity>
            <Studio />
            <Product color={color} shade={shade} />
        </>
    );
}

function App() {
    const [paint, setPaint] = useState(PAINTS[0]);

    return (
        <>
            <Application>
                <Scene color={paint.color} shade={paint.shade} />
            </Application>
            <div className="hud">
                <section className="panel">
                    <h1>Product Configurator</h1>
                    <p>Choose a paint finish, then drag to orbit.</p>
                    <div className="controls variants">
                        {PAINTS.map((item) => (
                            <button key={item.name} aria-pressed={paint === item} onClick={() => setPaint(item)}>
                                <span className="finish" style={{ '--color': item.color } as React.CSSProperties} />
                                {item.name}
                            </button>
                        ))}
                    </div>
                </section>
            </div>
        </>
    );
}

export default App;
