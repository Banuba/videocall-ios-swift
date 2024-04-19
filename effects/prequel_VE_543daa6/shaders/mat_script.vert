#include <bnb/glsl.vert>
#include <bnb/decode_int1010102.glsl>
#include<bnb/matrix_operations.glsl>
#define bnb_IDX_OFFSET 0
#ifdef BNB_VK_1
#ifdef gl_VertexID
#undef gl_VertexID
#endif
#ifdef gl_InstanceID
#undef gl_InstanceID
#endif
#define gl_VertexID gl_VertexIndex
#define gl_InstanceID gl_InstanceIndex
#endif


#define ANGLE -90.

BNB_LAYOUT_LOCATION(0) BNB_IN vec3 attrib_pos;
#ifdef GLFX_LIGHTING
#ifdef BNB_VK_1
BNB_LAYOUT_LOCATION(1) BNB_IN uint attrib_n;
#else
BNB_LAYOUT_LOCATION(1) BNB_IN vec4 attrib_n;
#endif
#ifdef GLFX_TBN
#ifdef BNB_VK_1
BNB_LAYOUT_LOCATION(2) BNB_IN uint attrib_t;
#else
BNB_LAYOUT_LOCATION(2) BNB_IN vec4 attrib_t;
#endif
#endif
#endif
BNB_LAYOUT_LOCATION(3) BNB_IN vec2 attrib_uv;
#ifndef BNB_GL_ES_1
BNB_LAYOUT_LOCATION(4) BNB_IN uvec4 attrib_bones;
#else
BNB_LAYOUT_LOCATION(4) BNB_IN vec4 attrib_bones;
#endif
#ifndef BNB_1_BONE
BNB_LAYOUT_LOCATION(5) BNB_IN vec4 attrib_weights;
#endif





BNB_DECLARE_SAMPLER_2D(2, 3, bnb_BONES);

#ifdef BNB_USE_UVMORPH

BNB_DECLARE_SAMPLER_2D(4, 5, bnb_UVMORPH_FISHEYE);
#endif

#ifdef GLFX_OCCLUSION
BNB_OUT(2) vec2 glfx_OCCLUSION_UV;
#endif

#ifdef BNB_USE_AUTOMORPH

BNB_DECLARE_SAMPLER_2D(6, 7, bnb_MORPH);
#ifndef BNB_AUTOMORPH_BONE
#else
#endif
#endif

#ifdef BNB_USE_SHADOW

BNB_OUT(3) vec3 var_shadow_coord;
vec3 spherical_proj( vec2 fovM, vec2 fovP, float zn, float zf, vec3 v )
{
    vec2 xy = (atan( v.xy, v.zz )-(fovP+fovM)*0.5)/((fovP-fovM)*0.5);
    float z = (length(v)-(zn+zf)*0.5)/((zf-zn)*0.5);
    return vec3( xy, z );
}
#endif

BNB_OUT(0) vec2 var_uv;
#ifdef GLFX_LIGHTING
#ifdef GLFX_TBN
BNB_OUT(4) vec3 var_t;
BNB_OUT(5) vec3 var_b;
#endif
BNB_OUT(6) vec3 var_n;
BNB_OUT(7) vec3 var_v;
#endif



#include <bnb/anim_transform.glsl>
#include <bnb/morph_transform.glsl>
#include <bnb/get_bone.glsl>
void main()
{   
    float screenRate = bnb_SCREEN.x/bnb_SCREEN.y;

    float scale = js_pos_time.z * 0.0019;
    float angle = js_pos_time.w;

    mat4 m = bnb_get_transform();
    vec3 vpos = attrib_pos;
    var_uv = attrib_uv;

    if(attrib_pos.z == 0.) {
        var_uv += js_timeData0.xy;
    } else if(attrib_pos.z == -1.) {
        var_uv += vec2(0.,-0.145);
    } else if(attrib_pos.z == -2.) {
        var_uv += vec2(0.,0.);
    } else if(attrib_pos.z == -3.) {
        var_uv += js_timeData1.xy;
    } else if(attrib_pos.z == -4.) {
        var_uv += js_timeData1.zw;
    }

    float cosX = -cos(radians(angle));
	float sinX = sin(radians(angle));

	float sinZ = cosX + sinX;
	float cosZ = cosX + sinX;
    
 	float z = atan(sinZ, cosZ);

	mat4 rot_z = mat4(cosX, -sinX, 0., 0.,
                    sinX, cosX, 0., 0.,
                    0., 0., 0., 0.,
                    0., 0., 0., 1.);

#ifdef BNB_USE_UVMORPH
    const float max_range = 40.;
    vec3 translation = BNB_TEXTURE_2D(BNB_SAMPLER_2D(bnb_UVMORPH_FISHEYE), vec3(smoothstep(0.,1.,attrib_uv),float(gl_InstanceID)) ).xyz*(2.*max_range) - max_range;
#ifdef GLFX_UVMORPH_Z_UP
    vpos += vec3(translation.x,-translation.z,translation.y);
#else
    vpos += translation;
#endif
#endif

    vpos = (rot_z * vec4(vpos,1.)*m).xyz - vec3(bnb_SCREEN.x/1.3,-bnb_SCREEN.y/10.,0.);

#ifdef BNB_USE_AUTOMORPH
#ifndef BNB_AUTOMORPH_BONE
    vpos = bnb_auto_morph( vpos );
#else
    vpos = bnb_auto_morph_bone( vpos, m );
#endif
#endif

    vpos.xyz *= vec3(scale,scale*screenRate,0.); // resize
    gl_Position =  vec4(vpos + vec3(js_pos_time.xy,0.),1.);

#ifdef GLFX_LIGHTING
    var_n = mat3(bnb_MV)*(bnb_decode_int1010102(attrib_n).xyz*mat3(m));
#ifdef GLFX_TBN
    var_t = mat3(bnb_MV)*(bnb_decode_int1010102(attrib_t).xyz*mat3(m));
    var_b = bnb_decode_int1010102(attrib_t).w*cross( var_n, var_t );
#endif
    var_v = (bnb_MV*vec4(vpos,1.)).xyz;
#endif
#ifdef BNB_USE_SHADOW

    var_shadow_coord = spherical_proj(
        vec2(-radians(60.),-radians(20.)),vec2(radians(60.),radians(100.)),
        400.,70.,
        vpos+vec3(0.,100.,50.))*0.5+0.5;
#endif
#ifdef GLFX_OCCLUSION
    glfx_OCCLUSION_UV = (gl_Position.xy / gl_Position.w - glfx_OCCLUSION_RECT.xy) / glfx_OCCLUSION_RECT.zw;
    glfx_OCCLUSION_UV = glfx_OCCLUSION_UV * 0.5 + 0.5;
    glfx_OCCLUSION_UV.y = 1.0 - glfx_OCCLUSION_UV.y;
#endif
}