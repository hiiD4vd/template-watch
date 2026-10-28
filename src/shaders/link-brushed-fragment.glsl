/// #replace #define SIXTY_RADIANCE
float occlusion=1.;occlusion=.2+smoothstep(-.0,1.,geometryNormal.z)*.8;float dotNV=saturate(dot(geometryNormal,geometryViewDir));reflectedLight.indirectSpecular*=smoothstep(0.,.6,sqrt(computeSpecularOcclusion(dotNV,occlusion,pbrMaterial.roughness)));
