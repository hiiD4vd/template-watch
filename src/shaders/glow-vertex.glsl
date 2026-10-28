/// #replace vObjectNormal = transformedNormal;
float distFromCenter=length(position.xy);float edgeFactor=pow(smoothstep(0.0,.035,distFromCenter),4.0);vec2 radialDirection=normalize(position.xy);transformedNormal.xy+=radialDirection*edgeFactor*4.0;transformedNormal=normalize(transformedNormal);vObjectNormal=transformedNormal;
