#include <bnb/glsl.frag>


BNB_IN(0) vec3 var_v;
BNB_IN(1) vec2 var_bgmask_uv;

BNB_DECLARE_SAMPLER_2D(2, 3, glfx_BG_MASK);
BNB_DECLARE_SAMPLER_CUBE(0, 1, tex_env);

void main()
{
	float mask = BNB_TEXTURE_2D( BNB_SAMPLER_2D(glfx_BG_MASK), var_bgmask_uv ).x;
	vec3 env = BNB_TEXTURE_CUBE(BNB_SAMPLER_CUBE(tex_env), var_v ).xyz;
	bnb_FragColor = vec4( env, sqrt(mask) );
}
