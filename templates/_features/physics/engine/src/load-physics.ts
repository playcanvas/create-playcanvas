import { WasmModule } from 'playcanvas';

const PATH = '/ammo';

export const loadPhysics = () =>
    new Promise<void>((resolve, reject) => {
        WasmModule.setConfig('Ammo', {
            glueUrl: `${PATH}/ammo.wasm.js`,
            wasmUrl: `${PATH}/ammo.wasm.wasm`,
            fallbackUrl: `${PATH}/ammo.js`,
            errorHandler: (error) => reject(new Error(error))
        });
        WasmModule.getInstance('Ammo', () => resolve());
    });
