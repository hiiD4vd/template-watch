/// #replace #define SIXTY_UNIFORMS_AREA
uniform sampler2D tNNoise;
/// #replace #define SIXTY_NORMAL_AREA
float distFromCenter=length(vCustomPosition.xy);float edgeFactor=pow(smoothstep(0.0,.08,distFromCenter),3.0);vec2 nnoise=texture2D(tNNoise,sin(distFromCenter*5.)*.05+length(vCustomPosition.xy*5.)*0.1*vec2(sin(180.*atan(vCustomPosition.x,vCustomPosition.y)))).rg;normal.xy+=nnoise*.2;vec2 radialDirection=normalize(vCustomPosition.xy);normal.xy+=radialDirection*edgeFactor*4.0;normal=normalize(normal);
/// #replace #define SIXTY_END_AREA
gl_FragColor.rgb=mix(max(gl_FragColor.rgb,smoothstep(.5,.8,length(nnoise))*.3)*occlusion,gl_FragColor.rgb,uDarknessProgress);
