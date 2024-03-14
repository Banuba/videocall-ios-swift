#include <bnb/glsl.frag>


#define Y_OFFSET 0.3
#define Y_SCALE 0.12
#define X_OFFSET 0.1
#define X_SCALE 0.5
BNB_IN(0) vec2 var_uv;




BNB_DECLARE_SAMPLER_VIDEO(0, 1, glfx_VIDEO);

void main()
{	
	vec2 uv = var_uv;
	uv.y = 1. - uv.y;
	
	uv.y *= 0.3;
	uv.y += 0.702;
	uv.x *= 0.5;
	vec3 rgb = BNB_TEXTURE_2D(BNB_SAMPLER_2D(glfx_VIDEO),uv).xyz;

	uv.x += 0.5;
	float a = BNB_TEXTURE_2D(BNB_SAMPLER_2D(glfx_VIDEO),uv).x;
	bnb_FragColor = vec4(rgb,a);
}
