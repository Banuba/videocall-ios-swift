#include <bnb/glsl.frag>


#define GLFX_IBL
#define GLFX_TBN
#define GLFX_LIGHTS
#define GLFX_LIGHTING
#define BNB_USE_UVMORPH

#define NUM_POINT_LIGHTS 4

BNB_IN(0) vec2 var_uv;
BNB_IN(1) vec3 var_t;
BNB_IN(2) vec3 var_b;
BNB_IN(3) vec3 var_n;
BNB_IN(4) vec3 var_v;



BNB_DECLARE_SAMPLER_2D(0, 1, tex_diffuse);

BNB_DECLARE_SAMPLER_2D(2, 3, tex_normal);

BNB_DECLARE_SAMPLER_2D(4, 5, tex_metallic);

BNB_DECLARE_SAMPLER_2D(6, 7, tex_roughness);


// gamma to linear
vec3 g2l( vec3 g )
{
    return g*(g*(g*0.305306011+0.682171111)+0.012522878);
}

// combined hdr to ldr and linear to gamma
vec3 l2g( vec3 l )
{
    return sqrt(1.33*(1.-exp(-l)))-0.03;
}

vec3 fresnel_schlick( float prod, vec3 F0 )
{
    return F0 + ( 1. - F0 )*pow( 1. - prod, 5. );
}

vec3 fresnel_schlick_roughness( float prod, vec3 F0, float roughness )
{
    return F0 + ( max( F0, 1. - roughness ) - F0 )*pow( 1. - prod, 5. );
}

float distribution_GGX( float cN_H, float roughness )
{
    float a = roughness*roughness;
    float a2 = a*a;
    float d = cN_H*cN_H*( a2 - 1. ) + 1.;
    return a2/(3.14159265*d*d);
}

float geometry_schlick_GGX( float NV, float roughness )
{
    float r = roughness + 1.;
    float k = r*r/8.;
    return NV/( NV*( 1. - k ) + k );
}

float geometry_smith( float cN_L, float ggx2, float roughness )
{
    return geometry_schlick_GGX( cN_L, roughness )*ggx2;
}

float diffuse_factor( float n_l, float w )
{
    float w1 = 1. + w;
    return pow( max( 0., n_l + w )/w1, w1 );
}

#ifdef GLFX_IBL

BNB_DECLARE_SAMPLER_2D(8, 9, tex_brdf);

BNB_DECLARE_SAMPLER_CUBE(10, 11, tex_ibl_diff);

BNB_DECLARE_SAMPLER_CUBE(12, 13, tex_ibl_spec);
#endif

#ifdef GLFX_LIGHTS
// pos in xyz, lwrap in w
BNB_IN(5) vec4 light1;
BNB_IN(6) vec4 light2;
BNB_IN(7) vec4 light3;
BNB_IN(8) vec4 light4;

BNB_IN(9) vec3 radiance1;
BNB_IN(10) vec3 radiance2;
BNB_IN(11) vec3 radiance3;
BNB_IN(12) vec3 radiance4;

#endif


void main()
{

    vec4 lights[4];
    lights[0] = light1;
    lights[1] = light2;
    lights[2] = light3;
    lights[3] = light4;

        vec3 radiance[4];
    radiance[0] = radiance1;
    radiance[1] = radiance2;
    radiance[2] = radiance3;
    radiance[3] = radiance4;

    vec4 base_opacity = BNB_TEXTURE_2D(BNB_SAMPLER_2D(tex_diffuse),var_uv);
    // base_opacity= vec4(1.);

    vec3 base = g2l(base_opacity.xyz);
    float opacity = base_opacity.w;

    float metallic = BNB_TEXTURE_2D(BNB_SAMPLER_2D(tex_metallic),var_uv).x;
    float roughness = BNB_TEXTURE_2D(BNB_SAMPLER_2D(tex_roughness),var_uv).x;

#ifdef GLFX_TBN
    vec3 N = normalize( mat3(var_t,var_b,var_n)*(BNB_TEXTURE_2D(BNB_SAMPLER_2D(tex_normal),var_uv).xyz*2.-1.) );
#else
    vec3 N = normalize( var_n );
#endif

    vec3 V = normalize( -var_v );
    float cN_V = max( 0., dot( N, V ) );
    vec3 R = reflect( -V, N );

    vec3 F0 = mix( vec3(0.04), base, metallic );

#ifdef GLFX_IBL
    vec3 F = fresnel_schlick_roughness( cN_V, F0, roughness );
    vec3 kD = ( 1. - F )*( 1. - metallic );   
    
    vec3 diffuse = BNB_TEXTURE_CUBE(BNB_SAMPLER_CUBE(tex_ibl_diff), N ).xyz * base;
    
    const float MAX_REFLECTION_LOD = 7.; // number of mip levels in tex_ibl_spec
    vec3 prefilteredColor = BNB_TEXTURE_CUBE_LOD(BNB_SAMPLER_CUBE(tex_ibl_spec), R, roughness*MAX_REFLECTION_LOD ).xyz;
    vec2 brdf = BNB_TEXTURE_2D(BNB_SAMPLER_2D(tex_brdf), vec2( cN_V, roughness ) ).yx;
    vec3 specular = prefilteredColor * (F * brdf.x + brdf.y);
    
    float pow_spec = 0.5;

    specular.x = pow(specular.x,pow_spec);
    specular.y = pow(specular.y,pow_spec);
    specular.z = pow(specular.z,pow_spec);

    
    vec3 color = (kD*diffuse + specular);
#else
    vec3 color = 0.03*base; // ambient
#endif

#ifdef GLFX_LIGHTS
    float ggx2 = geometry_schlick_GGX( cN_V, roughness );
    for( int i = 0; i != lights.length(); ++i )
    {
        float attenuation = 10000./max(dot(lights[i].xyz,lights[i].xyz),0.01*0.01);
        vec3 L = normalize(lights[i].xyz);
        float lwrap = lights[i].w;
        vec3 H = normalize( V + L );
        float N_L = dot( N, L );
        float cN_L = max( 0., N_L );
        float cN_H = max( 0., dot( N, H ) );
        float cH_V = max( 0., dot( H, V ) );

        float NDF = distribution_GGX( cN_H, roughness );
        float G = geometry_smith( cN_L, ggx2, roughness );
        vec3 F_light = 2.*fresnel_schlick( cH_V, F0 );

        vec3 specular = NDF*G*F_light/( 4.*cN_V*cN_L + 0.001 );

        vec3 kD_light = ( 1. - F_light )*( 1. - metallic );

        vec3 lamp_light = ( kD_light*base/3.14159265 + specular )*(radiance[i]*attenuation)*diffuse_factor( N_L, lwrap )/*cN_L*/;

        float pow_lamp = 0.8;

        lamp_light.x = pow(lamp_light.x,pow_lamp);
        lamp_light.y = pow(lamp_light.y,pow_lamp);
        lamp_light.z = pow(lamp_light.z,pow_lamp);

        color += 0.15*lamp_light;
    }
#endif

    bnb_FragColor = vec4(l2g(color),opacity);
}