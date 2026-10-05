import type { AppBase, Entity } from 'playcanvas';
import { XRSPACE_LOCALFLOOR, XRTYPE_VR } from 'playcanvas';
import { XrControllers } from 'playcanvas/scripts/esm/xr/xr-controllers.mjs';
import { XrNavigation } from 'playcanvas/scripts/esm/xr/xr-navigation.mjs';

export const setupVr = (app: AppBase, rig: Entity, camera: Entity) => {
    // attach the controller and locomotion scripts to the player rig, without vertical snap, which
    // would let the right stick move the rig through the floor
    if (!rig.script) rig.addComponent('script');
    rig.script!.create(XrControllers);
    rig.script!.create(XrNavigation, {
        properties: { enableMove: true, enableTeleport: true, turnMode: 'snap', enableSnapVertical: false }
    });

    const button = document.getElementById('xr-button') as HTMLButtonElement;
    const status = document.getElementById('xr-status')!;
    const { graphicsDevice: device, xr } = app;

    // a session takes over the pixel ratio and the camera pose, so keep the page's to restore on exit
    const pixelRatio = device.maxPixelRatio;
    const position = camera.getLocalPosition().clone();
    const rotation = camera.getLocalRotation().clone();

    // availability can change after the page loads
    const update = () => {
        const available = xr?.isAvailable(XRTYPE_VR) ?? false;
        button.disabled = !available;
        status.textContent = available ? 'VR is available' : 'VR requires a compatible headset and secure context';
    };
    const restore = () => {
        device.maxPixelRatio = pixelRatio;
        camera.setLocalPosition(position);
        camera.setLocalRotation(rotation);
        update();
    };
    button.onclick = () => {
        // a second request while the first is pending leaves the XR manager unusable
        button.disabled = true;

        // XR renders at maxPixelRatio / devicePixelRatio of the headset's recommended resolution, so
        // matching the display gives exactly that - an uncapped ratio would fail the session
        device.maxPixelRatio = window.devicePixelRatio;
        camera.camera?.startXr(XRTYPE_VR, XRSPACE_LOCALFLOOR, {
            callback: (error) => {
                if (!error) return;
                device.maxPixelRatio = pixelRatio;
                button.disabled = false;
                status.textContent = error.message;
            }
        });
    };
    xr?.on(`available:${XRTYPE_VR}`, update);
    xr?.on('end', restore);
    update();

    return () => {
        button.onclick = null;
        xr?.off(`available:${XRTYPE_VR}`, update);
        xr?.off('end', restore);
        rig.script?.destroy('xrControllers');
        rig.script?.destroy('xrNavigation');
    };
};
