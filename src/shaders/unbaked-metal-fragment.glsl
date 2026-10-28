/// #replace #define SIXTY_UNIFORMS_AREA
varying vec2 vUv1;uniform vec3 uBlueMetalColor;uniform vec3 uGoldMetalColor;
/// #replace #define SIXTY_DIFFUSE_AREA
diffuseColor.rgb=mix(diffuseColor.rgb,uGoldMetalColor,step(1.,vUv1.x));diffuseColor.rgb=mix(diffuseColor.rgb,uBlueMetalColor,step(2.,vUv1.x));
