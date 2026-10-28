uniform sampler2D tMap;varying vec2 vUv;void main(){gl_FragColor=vec4(0.,0.,0.,0.4*smoothstep(0.35,.5,distance(vUv,vec2(0.5))));}
