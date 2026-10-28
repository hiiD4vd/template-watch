/// #replace #define SIXTY_UNIFORMS_AREA
#define SIXTY_UNIFORMS_AREA
/// #replace #define SIXTY_NORMAL_AREA
normal=normalize(normal);
/// #replace #define SIXTY_ENVMAP_AREA
#define SIXTY_ENVMAP_AREA
/// #replace #define SIXTY_END_AREA
#define SIXTY_END_AREA
gl_FragColor.a=smoothstep(.9,1.,length(vNormal.xy))*.2+smoothstep(.0,1.,min(2.,length(gl_FragColor.rgb)))*.2;gl_FragColor.a*=mix(smoothstep(.1,.2,length(vNormal.xy)),1.,smoothstep(.005,.017,length(vCustomPosition.xy)));
