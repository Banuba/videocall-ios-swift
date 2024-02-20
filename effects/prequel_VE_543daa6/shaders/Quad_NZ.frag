#include <bnb/glsl.frag>


BNB_IN(0) vec2 var_uv;
BNB_IN(1) float var_time;
BNB_IN(2) float var_seed_size;



BNB_DECLARE_SAMPLER_2D(0, 1, glfx_BACKGROUND);

void main()
{
	vec2 uv = var_uv;
	uv.y = 1. - uv.y;
	vec4 color = BNB_TEXTURE_2D(BNB_SAMPLER_2D(glfx_BACKGROUND),uv);
    
    float x = (uv.x + 4.0 ) * (uv.y + 4.0 ) * (var_time * 10.0);
	vec4 grain = vec4(mod((mod(x, 13.0) + 1.0) * (mod(x, 123.0) + 1.0), 0.01)-0.005) * var_seed_size;

	bnb_FragColor = color + grain;
}
