/// #replace #define SIXTY_UNIFORMS_AREA
varying vec2 vUv1;varying mat3 vNormalMatrix;
/// #replace float roughness = clamp(armSample.g * uRoughness, 0.04, 1.0);
float roughness=clamp(armSample.g*uRoughness,0.04,1.0);roughness=mix(roughness,.2,step(vUv1.x,-3.));
/// #replace #define SIXTY_NORMALIZE
float mask=step(1.,vUv1.x);float x=smoothstep(1.,2.,vUv1.x-step(2.,vUv1.x))-.5;x*=mask;x*=mix(-1.,1.,step(2.,vUv1.x));vec3 modifiedObjectNormal=vObjectNormal;modifiedObjectNormal.x+=x*1.;vec3 col0=normalize(vNormalMatrix[0]);vec3 col1=normalize(vNormalMatrix[1]-dot(vNormalMatrix[1],col0)*col0);vec3 col2=cross(col0,col1);mat3 orthogonalNormalMatrix=mat3(col0,col1,col2);normal=normalize(orthogonalNormalMatrix*modifiedObjectNormal);
/// #replace #define SIXTY_END_AREA
gl_FragColor.rgb=adjustSaturation(gl_FragColor.rgb,1.+1.7*smoothstep(.8,.0,length(gl_FragColor.rgb)));gl_FragColor.rgb*=mix(1.,1.-smoothstep(0.002,.007,vCustomPosition.z)*.7,step(vUv1.x,-3.)*step(vCustomPosition.z,.0061));
