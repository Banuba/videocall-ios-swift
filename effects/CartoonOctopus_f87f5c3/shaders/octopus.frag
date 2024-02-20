#include <bnb/glsl.frag>


//#define BNB_USE_SHADOW

#define GLFX_TBN
#define GLFX_TEX_MRAO
//#define GLFX_TEX_AO

BNB_IN(0) vec2 var_uv;
#ifdef GLFX_TBN
BNB_IN(1) vec3 var_t;
BNB_IN(2) vec3 var_b;
#endif
BNB_IN(3) vec3 var_n;
BNB_IN(4) vec3 var_v;



BNB_DECLARE_SAMPLER_2D(6, 7, tex_diffuse);
#ifdef GLFX_TBN

BNB_DECLARE_SAMPLER_2D(0, 1, tex_normal);
#endif
#ifdef GLFX_TEX_MRAO

BNB_DECLARE_SAMPLER_2D(2, 3, tex_mrao);
#else
#endif
#ifdef GLFX_TEX_AO
#endif

#ifdef BNB_USE_SHADOW

BNB_IN(5) vec3 var_shadow_coord;
float glfx_shadow_factor()
{

	vec2 offsets[4];
	offsets[0] = vec2( -0.94201624, -0.39906216 );
	offsets[1] = vec2( 0.94558609, -0.76890725 );
	offsets[2] = vec2( -0.094184101, -0.92938870 );
	offsets[3] = vec2( 0.34495938, 0.29387760 );
	float s = 0.;
	for( int i = 0; i != 4 /*assume that offsets.length() was called.*/; ++i )
		s += texture( glfx_SHADOW, var_shadow_coord + vec3(offsets[i]/110.,0.1) );
	s *= 0.125;
	return s;
}
#endif

// gamma to linear
vec3 g2l( vec3 g )
{
	return g*(g*(g*0.305306011+0.682171111)+0.012522878);
}

// linear to gamma
vec3 l2g( vec3 l )
{
	vec3 s = sqrt(l);
	vec3 q = sqrt(s);
	return 0.662002687*s + 0.68412206*q - 0.323583601*sqrt(q) - 0.022541147*l;
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

// direction in xyz, lwrap in w


BNB_DECLARE_SAMPLER_2D(4, 5, tex_brdf);

BNB_DECLARE_SAMPLER_CUBE(8, 9, tex_ibl_diff);

BNB_DECLARE_SAMPLER_CUBE(10, 11, tex_ibl_spec);

void main()
{
	vec3 radiance[2];
	radiance[1] = vec3(1.,1.,1.)*0.9*2.;
	radiance[0] = vec3(1.,1.,1.)*2.;
	vec4 lights[2];
	lights[1] = vec4(normalize(vec3(-197.6166,150.,3.151)),1.);
	lights[0] = vec4(0.,0.6,0.8,1.);
	vec4 base_opacity = BNB_TEXTURE_2D(BNB_SAMPLER_2D(tex_diffuse),var_uv);

	//if( base_opacity.w < 0.5 ) discard;

	vec3 base = g2l(base_opacity.xyz);
	float opacity = base_opacity.w;
#ifdef GLFX_TEX_MRAO
	vec2 metallic_roughness = BNB_TEXTURE_2D(BNB_SAMPLER_2D(tex_mrao),var_uv).xy;
	float metallic = metallic_roughness.x;
	float roughness = metallic_roughness.y;
#else
	float metallic = BNB_TEXTURE_2D(BNB_SAMPLER_2D(tex_metallic),var_uv).x;
	float roughness = BNB_TEXTURE_2D(BNB_SAMPLER_2D(tex_roughness),var_uv).x;
#endif

#ifdef GLFX_TBN
	vec3 N = normalize( mat3(var_t,var_b,var_n)*(BNB_TEXTURE_2D(BNB_SAMPLER_2D(tex_normal),var_uv).xyz*2.-1.) );
#else
	vec3 N = normalize( var_n );
#endif
	vec3 V = normalize( -var_v );
	float cN_V = max( 0., dot( N, V ) );
	vec3 R = reflect( -V, N );

	//float ggx2 = geometry_schlick_GGX( cN_V, roughness );
	vec3 F0 = mix( vec3(0.04), base, metallic );

	vec3 F = fresnel_schlick_roughness( cN_V, F0, roughness );
	vec3 kD = ( 1. - F )*( 1. - metallic );	  
	
	vec3 diffuse = BNB_TEXTURE_CUBE(BNB_SAMPLER_CUBE(tex_ibl_diff), N ).xyz * base;
	
	const float MAX_REFLECTION_LOD = 4.0;
	vec3 prefilteredColor = BNB_TEXTURE_CUBE_LOD(BNB_SAMPLER_CUBE(tex_ibl_spec), R, roughness * MAX_REFLECTION_LOD ).xyz;
	vec2 brdf = BNB_TEXTURE_2D(BNB_SAMPLER_2D(tex_brdf), vec2( cN_V, roughness ) ).wz;	// TODO .xy
	vec3 specular = prefilteredColor * (F * brdf.x + brdf.y);

	vec3 color = (kD*diffuse + specular);

#ifdef GLFX_TEX_AO
	color *= BNB_TEXTURE_2D(BNB_SAMPLER_2D(tex_ao),var_uv).x;
#endif

#ifdef BNB_USE_SHADOW

	color = mix( color, vec3(0.), glfx_shadow_factor() );
#endif

	bnb_FragColor = vec4(l2g(color),opacity);
}
