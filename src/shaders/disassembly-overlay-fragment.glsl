varying vec2 vUv;uniform float uTime;uniform float uProgress;uniform float uOpacity;uniform float uOpacityMultiplier;uniform float uScreenX;uniform float uZoomProgress;
#define GRADIENT_SIZE 0.05
void main(){float screenX=smoothstep(-2.,2.,uScreenX);float overlaySize=0.03+uZoomProgress*0.1;gl_FragColor=vec4(0.,0.,0.,(smoothstep(screenX-overlaySize,screenX-(overlaySize+GRADIENT_SIZE),vUv.x)+smoothstep(screenX+overlaySize,screenX+(overlaySize+GRADIENT_SIZE),vUv.x))*uProgress*uOpacity*uOpacityMultiplier*.7);gl_FragColor.a=0.;}
