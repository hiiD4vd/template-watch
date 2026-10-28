#ifdef USE_UV
varying vec2 vUv;
#endif
varying vec3 vNormal;varying vec3 vCustomPosition;varying vec3 vObjectNormal;varying vec3 vViewPosition;
#ifdef SIXTY_MAP
uniform mat3 uMapTransform;varying vec2 vMapUv;
#endif
#ifdef SIXTY_ARMMAP
uniform mat3 uArmMapTransform;varying vec2 vArmMapUv;
#endif
#ifdef SIXTY_AOMAP
uniform mat3 uAoMapTransform;varying vec2 vAoMapUv;
#endif
#ifdef SIXTY_EMISSIVEMAP
uniform mat3 uEmissiveMapTransform;varying vec2 vEmissiveMapUv;
#endif
#ifdef SIXTY_NORMALMAP
uniform mat3 uNormalMapTransform;varying vec2 vNormalMapUv;
#endif
#ifdef USE_MORPHTARGETS
#ifndef USE_INSTANCING_MORPH
uniform float morphTargetBaseInfluence;uniform float morphTargetInfluences[MORPHTARGETS_COUNT];
#endif
uniform sampler2DArray morphTargetsTexture;uniform ivec2 morphTargetsTextureSize;vec4 getMorph(const in int vertexIndex,const in int morphTargetIndex,const in int offset){int texelIndex=vertexIndex*MORPHTARGETS_TEXTURE_STRIDE+offset;int y=texelIndex/morphTargetsTextureSize.x;int x=texelIndex-y*morphTargetsTextureSize.x;ivec3 morphUV=ivec3(x,y,morphTargetIndex);return texelFetch(morphTargetsTexture,morphUV,0);}
#endif
varying float vDebug;
#define SIXTY_UNIFORMS_AREA
void main(){
#define SIXTY_START_AREA
#ifdef USE_UV
vUv=uv;
#endif
#ifdef SIXTY_MAP
vMapUv=(uMapTransform*vec3(SIXTY_MAP_UV,1.)).xy;
#endif
#ifdef SIXTY_ARMMAP
vArmMapUv=(uArmMapTransform*vec3(SIXTY_ARMMAP_UV,1.)).xy;
#endif
#ifdef SIXTY_AOMAP
vAoMapUv=(uAoMapTransform*vec3(SIXTY_AOMAP_UV,1.)).xy;
#endif
#ifdef SIXTY_EMISSIVEMAP
vEmissiveMapUv=(uEmissiveMapTransform*vec3(SIXTY_EMISSIVEMAP_UV,1.)).xy;
#endif
#ifdef SIXTY_NORMALMAP
vNormalMapUv=(uNormalMapTransform*vec3(SIXTY_NORMALMAP_UV,1.)).xy;
#endif
vec3 objectNormal=normal;
#ifdef USE_MORPHNORMALS
objectNormal*=morphTargetBaseInfluence;
#endif
vec3 transformedNormal=objectNormal;
#ifdef USE_INSTANCING
mat3 im=mat3(instanceMatrix);transformedNormal/=vec3(dot(im[0],im[0]),dot(im[1],im[1]),dot(im[2],im[2]));transformedNormal=im*transformedNormal;
#endif
#define SIXTY_TRANSFORMED_NORMAL_AREA
vObjectNormal=transformedNormal;transformedNormal=normalMatrix*transformedNormal;vNormal=normalize(transformedNormal);vCustomPosition=position;vec3 transformed=position;
#ifdef USE_MORPHTARGETS
transformed*=morphTargetBaseInfluence;for(int i=0;i<MORPHTARGETS_COUNT;i++){if(morphTargetInfluences[i]!=0.0)transformed+=getMorph(gl_VertexID,i,0).xyz*morphTargetInfluences[i];}
#endif
#define SIXTY_TRANSFORMED_AREA
vec4 mvPosition=vec4(transformed,1.);
#ifdef USE_INSTANCING
#define SIXTY_INSTANCING_START_AREA
mvPosition=instanceMatrix*mvPosition;
#endif
mvPosition=modelViewMatrix*mvPosition;vViewPosition=-mvPosition.xyz;gl_Position=projectionMatrix*mvPosition;
#define SIXTY_END_AREA
#define DEBUG_NONE 0
#define DEBUG_UV 1
#define DEBUG_UV1 2
#define DEBUG_UV2 3
#define DEBUG_UV3 4
#define DEBUG_NORMAL_TEXTURE 5
#define DEBUG_NORMAL_SHADING 6
#define DEBUG_NORMAL_GEOMETRY 7
#define DEBUG_TANGENT 8
#define DEBUG_BITANGENT 9
#define DEBUG_ALPHA 10
#define DEBUG_OCCLUSION 11
#define DEBUG_EMISSIVE 12
#define DEBUG_METALLIC 13
#define DEBUG_ROUGHNESS 14
#define DEBUG_BASE_COLOR 15
#define DEBUG_RADIANCE 16
#define DEBUG_IBL_IRRADIANCE 17
#ifdef DEBUG
#if DEBUG == DEBUG_UV1 && defined(USE_UV1)
vUv1=uv1;
#endif
#if DEBUG == DEBUG_UV2 && defined(USE_UV2)
vUv2=uv2;
#endif
#if DEBUG == DEBUG_UV3 && defined(USE_UV3)
vUv3=uv3;
#endif
#endif
}
