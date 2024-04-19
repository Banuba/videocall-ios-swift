#include <bnb/glsl.frag>


BNB_IN(0) vec2 var_uv;
// BNB_IN(1) vec2 var_pos;



BNB_DECLARE_SAMPLER_VIDEO(0, 1, glfx_VIDEO);

void main()
{   
	vec2 uv = var_uv;
	uv.y *= 0.7;
	
	uv.x *= 0.5;
	vec3 rgb = BNB_TEXTURE_2D(BNB_SAMPLER_2D(glfx_VIDEO),uv).xyz;

	uv.x += 0.5;
	float a = BNB_TEXTURE_2D(BNB_SAMPLER_2D(glfx_VIDEO),uv).x;
	bnb_FragColor = vec4(rgb,a);
}
