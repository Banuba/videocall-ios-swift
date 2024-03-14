#include <bnb/glsl.frag>


BNB_IN(0) vec2 var_uv;
BNB_IN(1) float var_offset;



BNB_DECLARE_SAMPLER_2D(0, 1, tex);

void main()
{
	vec2 uv = var_uv;
	
	bnb_FragColor = BNB_TEXTURE_2D(BNB_SAMPLER_2D(tex),uv);
}
