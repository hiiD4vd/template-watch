/// #replace #define SIXTY_UNIFORMS_AREA
uniform sampler2D uNNoise;varying vec2 vUv1;
/// #replace reflectedLight.indirectDiffuse *= occlusion;
float theta=atan(vCustomPosition.x,vCustomPosition.y);occlusion*=1.-(step(1.,vUv1.x)*smoothstep(0.002-.002*smoothstep(0.,1.,sin(theta+.7)),.0042,length(vCustomPosition.xy))*0.75+smoothstep(0.,1.,sin(theta+.7))*.18);reflectedLight.indirectDiffuse*=occlusion;
/// #replace #define SIXTY_NORMAL_AREA
normal.y+=sin(length(vCustomPosition.xy)*1000.)*.01*step(1.,vUv1.x);normal+=(texture2D(uNNoise,vUv1*vec2(1.,.01)).rgb+vCustomPosition.y*200.)*step(1.,vUv1.x)*.03;normal=normalize(normal);
/// #replace #define SIXTY_END_AREA
gl_FragColor.rgb=adjustSaturation(gl_FragColor.rgb,1.+1.7*smoothstep(.8,.0,length(gl_FragColor.rgb)));
