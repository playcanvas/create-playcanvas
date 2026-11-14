import type { AppBase, Entity } from 'playcanvas';
import { XRSPACE_LOCALFLOOR, XRTYPE_VR } from 'playcanvas';
import { XrControllers } from 'playcanvas/scripts/esm/xr/xr-controllers.mjs';
import { XrNavigation } from 'playcanvas/scripts/esm/xr/xr-navigation.mjs';

export const setupVr = (app: AppBase, rig: Entity, camera: Entity) => {
    // attach the controller and locomotion scripts to the player rig
    if (!rig.script) rig.addComponent('script');
    rig.script!.create(XrControllers);
    rig.script!.create(XrNavigation, {
        properties: { enableMove: true, enableTeleport: true, turnMode: 'snap' }
    });

    const button = document.getElementById('xr-button') as HTMLButtonElement;
    const status = document.getElementById('xr-status')!;
    const { xr } = app;

    // availability can change after the page loads
    const update = () => {
        const available = xr?.isAvailable(XRTYPE_VR) ?? false;
        button.disabled = !available;
        status.textContent = available ? 'VR is available' : 'VR requires a compatible headset and secure context';
    };
    button.onclick = () => {
        camera.camera?.startXr(XRTYPE_VR, XRSPACE_LOCALFLOOR, {
            callback: (error) => {
                if (error) status.textContent = error.message;
            }
        });
    };
    xr?.on(`available:${XRTYPE_VR}`, update);
    update();

    return () => {
        button.onclick = null;
        xr?.off(`available:${XRTYPE_VR}`, update);
        rig.script?.destroy('xrControllers');
        rig.script?.destroy('xrNavigation');
    };
};
