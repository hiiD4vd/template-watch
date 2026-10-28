precision highp float;uniform sampler2D tDiffuse,uNoise,tGradient;uniform float uRatio;uniform vec2 uResolution;uniform float uLongpress;uniform vec2 uMouse;uniform float uBackgroundMultiplier;uniform float uTime;varying vec2 vUv;
#define PI 3.14159265359
#define NEAR 1.
#define FAR 100.
#define CONTRAST 1.15
#define GAMMA 1.6
#define NOISE .05
#define FISHEYE .0
vec3 adjustSaturation(vec3 color,float saturation){return mix(vec3(dot(color,vec3(0.2125,0.7154,0.0721))),color,saturation);}float avg(vec3 c){return(c.x+c.y+c.z)/3.;}void main(){vec2 cUv=vUv-.5;float dtc=length(cUv);float border=smoothstep(.3,.7,dtc);vec2 dUv=(vUv-.5)*(1.-border*FISHEYE)+.5;vec2 uvNoise=texture2D(uNoise,vec2(vUv.x*uRatio,vUv.y)*4.).rg-.5;vec4 color=texture2D(tDiffuse,dUv);color.rgb=((color.rgb-0.5)*CONTRAST+0.5);color.rgb=pow(color.rgb,vec3(1.0/GAMMA));float bgBorder=smoothstep(.7,.3,length(dUv-.5));float t=uTime*.3;float backgroundIntensity=0.;vec2 sUv=dUv*.8+uMouse*.2;float mouseDist=length(dUv-uMouse*.5-.5);backgroundIntensity=(sin(sUv.x*4.*sin(sUv.x*4.)+t+sin(sUv.y*4.+t*1.3))-sin(sUv.y+t+sin(sUv.x*3.+t*1.)*4.))*.3;backgroundIntensity*=bgBorder;backgroundIntensity+=smoothstep(.7,.3,length(dUv-1.));backgroundIntensity=backgroundIntensity*.2+0.;backgroundIntensity*=uBackgroundMultiplier*1.5;color.rgb=mix(color.rgb,vec3(backgroundIntensity),1.-color.a);color.a=mix(color.a,1.,backgroundIntensity*(1.-color.a));gl_FragColor=color;}
