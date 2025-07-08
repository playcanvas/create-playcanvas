// // @ts-expect-error - ShadowCatcher is not typed
// import { Grid } from "playcanvas/scripts/esm/grid.mjs";
// import { useEffect, useState } from "react";
// import { Entity } from "@playcanvas/react";
// import { useEnvAtlas, useMaterial } from "@playcanvas/react/hooks";
// import { Camera, EnvAtlas, Render, Script } from "@playcanvas/react/components";
// import { OrbitControls } from "@playcanvas/react/scripts";

// /**
//  * The Scene renders a sphere with a grid and camera controls
//  */
// function Scene({ onClick }: SceneProps) {

//   // Track the hover state and set the color based on the hover state
//   const [hovering, setHovering] = useState(false);

//   // Set a material color based on the hover state
//   const diffuse =  hovering ? '#ffffff' : '#dddddd';

//   // Create a material for the sphere
//   const material = useMaterial({ diffuse });

//   // Load the environment map
//   const { asset: envMap } = useEnvAtlas('/environment-map.png');

//   // change the mouse cursor based on the hover state
//   useEffect(() => {
//     document.body.style.cursor = hovering ? 'pointer' : 'default';
//   }, [hovering]);

//   // Don't render until the environment map is loaded
//   if (!envMap) return null;

//   return (
//     <>
//       {/* Render some environment lighting using the environment map */}
//       <EnvAtlas asset={envMap} showSkybox={false} />

//       {/* Render a background grid */}
//       <Entity scale={[1000, 1000, 1000]}>
//         <Script script={Grid} />
//       </Entity>

//       {/* Create a camera entity with orbit controls */}
//       <Entity name='camera' position={[4, 1, 4]}>
//           <Camera clearColor='#171717' />
//           <OrbitControls />
//       </Entity>

//       {/* Create and position entity with pointer events */}
//       <Entity 
//         position={[0, 2, 0]} 
//         scale={[4, 4, 4]} 
//         onClick={onClick}
//         onPointerOver={() => setHovering(true)}
//         onPointerOut={() => setHovering(false)}
//         >
        
//         {/* Render a sphere with the material */}
//         <Render type="sphere" material={material} />
//       </Entity>
//     </>
//   )
// }

// type SceneProps = {
//   onClick: () => void;
// }

// export default Scene;