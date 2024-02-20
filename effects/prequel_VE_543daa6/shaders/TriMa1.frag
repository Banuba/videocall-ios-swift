#include <bnb/glsl.frag>
#include <bnb/lut.glsl>

BNB_IN(0) vec2 var_uv;

BNB_DECLARE_SAMPLER_2D(2, 3, glfx_BACKGROUND);
BNB_DECLARE_SAMPLER_2D(0, 1, luttex);

void main()
{
	bnb_FragColor = bnb_texture_lookup_512(BNB_TEXTURE_2D(BNB_SAMPLER_2D(glfx_BACKGROUND), var_uv),BNB_PASS_SAMPLER_ARGUMENT(luttex));
}
