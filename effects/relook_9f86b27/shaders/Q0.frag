#include <bnb/glsl.frag>


#define NUM_POINT_LIGHTS 4



BNB_IN(0) vec4 var_uv;



BNB_DECLARE_SAMPLER_2D(4, 5, glfx_BACKGROUND);

BNB_DECLARE_SAMPLER_2D(0, 1, glfx_LIPS_MASK);

BNB_DECLARE_SAMPLER_2D(2, 3, glfx_LIPS_SHINE_MASK);

const float eps = 0.0000001;

vec3 hsv2rgb( in vec3 c )
{
    vec3 rgb = clamp( abs( mod( c.x * 6.0 + vec3(0.0,4.0,2.0), 6.0 ) - 3.0 ) - 1.0, 0.0, 1.0 );
	return c.z * mix( vec3(1.0), rgb, c.y );
}

vec3 rgb2hsv( in vec3 c )
{
    vec4 k = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix( vec4(c.zy, k.wz), vec4(c.yz, k.xy), (c.z < c.y) ? 1.0 : 0.0 );
    vec4 q = mix( vec4(p.xyw, c.x), vec4(c.x, p.yzx), (p.x < c.x) ? 1.0 : 0.0 );
    float d = q.x - min( q.w, q.y );
    return vec3(abs( q.z + (q.w - q.y) / (6.0 * d + eps) ), d / (q.x+eps), q.x );
}

void main()
{
	vec4 maskColor = BNB_TEXTURE_2D(BNB_SAMPLER_2D(glfx_LIPS_MASK), var_uv.zw );
	float maskAlpha = maskColor[int(lips_nn_transform[0].w)] * js_color.w;

	vec3 bg = BNB_TEXTURE_2D(BNB_SAMPLER_2D(glfx_BACKGROUND), var_uv.xy ).xyz;

	// Lipstick
	float sCoef = params.x;;

	vec3 js_color_hsv = rgb2hsv( js_color.rgb );
	vec3 bg_color_hsv = rgb2hsv( bg );

	float color_hsv_s = js_color_hsv.g * sCoef;
	if ( sCoef > 1. ) {
		color_hsv_s = js_color_hsv.g + (1. - js_color_hsv.g) * (sCoef - 1.);
	}

	float vCoef = params.y;
	float sCoef1 = params.z;
	float bCoef = params.w;
	float a = 20.;
	float b = .75;

	vec3 color_lipstick = vec3(
		js_color_hsv.r,
		color_hsv_s,
		bg_color_hsv.b);

	vec3 color_lipstick_b = color_lipstick * vec3(1., 1., bCoef);
	vec3 color = maskAlpha * hsv2rgb( color_lipstick_b ) + (1. - maskAlpha) * bg;

	// Shine
	vec4 shineColor = BNB_TEXTURE_2D(BNB_SAMPLER_2D(glfx_LIPS_SHINE_MASK), var_uv.zw );
	float shineAlpha = 1.0 * shineColor[int(lips_nn_transform[0].w)] * js_color.w;

	float v_min = lips_shining_shine_params.x;
	float v_max = lips_shining_shine_params.y;

	float x = (color_lipstick.z - v_min) / (v_max - v_min);
	float y = 1. / (1. + exp( -(x - b) * a * (1. + x) ));

	float v1 = color_lipstick.z * (1. - maskAlpha) + color_lipstick.z * maskAlpha * bCoef;
	float v2 = color_lipstick.z + (1. - color_lipstick.z) * vCoef * y;
	float v3 = v1 * (1. - y) + v2 * y;

	vec3 color_shine = vec3(
		color_lipstick.x,
		color_lipstick.y * (1. - sCoef1 * y),
		v3);

	color = shineAlpha * hsv2rgb( color_shine ) + (1. - shineAlpha) * color;

	if(js_face.x == 0.) discard;

	bnb_FragColor = vec4(color, 1.0);
}
