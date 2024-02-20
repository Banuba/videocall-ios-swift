#include <bnb/glsl.frag>

#define UV_CHANGE 2.


BNB_IN(0) vec2 var_uv;
BNB_IN(1) vec2 var_bg_uv;
// BNB_IN(2) vec2 var_pos;


BNB_DECLARE_SAMPLER_2D(0, 1, glfx_BACKGROUND);

void main()
{   
	vec2 uv = var_uv;
	// uv.y = 1. - uv.y;
	uv.x = 1. - uv.x;

	uv.y *= 1./UV_CHANGE;
	uv.y += 1./6.;
	uv.x /= 1./1.4;
	uv.x -= 1./4.;
	bnb_FragColor = BNB_TEXTURE_2D(BNB_SAMPLER_2D(glfx_BACKGROUND),uv);
}
