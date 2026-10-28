uniform sampler2D tMap;varying vec2 vUv;uniform float uDarknessProgress;void main(){vec4 glow=texture2D(tMap,vUv);gl_FragColor=vec4(1.,1.,1.,glow.a*uDarknessProgress*0.5);}
