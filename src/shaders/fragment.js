const hsl2rgb = `
    // hsl2rgb written by Matt DesLauriers - https://github.com/Jam3/glsl-hsl2rgb/blob/master/index.glsl
    float hue2rgb(float f1, float f2, float hue) {
        if(hue < 0.0)
            hue += 1.0;
        else if(hue > 1.0)
            hue -= 1.0;
        float res;
        if((6.0 * hue) < 1.0)
            res = f1 + (f2 - f1) * 6.0 * hue;
        else if((2.0 * hue) < 1.0)
            res = f2;
        else if((3.0 * hue) < 2.0)
            res = f1 + (f2 - f1) * ((2.0 / 3.0) - hue) * 6.0;
        else
            res = f1;
        return res;
    }

    vec3 hsl2rgb(vec3 hsl) {
        vec3 rgb;

        if(hsl.y == 0.0) {
            rgb = vec3(hsl.z); // Luminance
        } else {
            float f2;

            if(hsl.z < 0.5)
                f2 = hsl.z * (1.0 + hsl.y);
            else
                f2 = hsl.z + hsl.y - hsl.y * hsl.z;

            float f1 = 2.0 * hsl.z - f2;

            rgb.r = hue2rgb(f1, f2, hsl.x + (1.0 / 3.0));
            rgb.g = hue2rgb(f1, f2, hsl.x);
            rgb.b = hue2rgb(f1, f2, hsl.x - (1.0 / 3.0));
        }
        return rgb;
    }

    vec3 hsl2rgb(float h, float s, float l) {
        return hsl2rgb(vec3(h, s, l));
    }
`

const hsb2rgb = `
//  Function from Iñigo Quiles
//  https://www.shadertoy.com/view/MsS3Wc
vec3 hsb2rgb( in vec3 c ){
    vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),
                             6.0)-3.0)-1.0,
                     0.0,
                     1.0 );
    rgb = rgb*rgb*(3.0-2.0*rgb);
    return c.z * mix( vec3(1.0), rgb, c.y);
}
`

export const fragment = /* glsl */ `
    varying vec2 vUv; 
    varying float vTime; 
    #define PI 3.1415926538

    ${hsl2rgb}
    ${hsb2rgb}

    void main() {
        float strength = ceil(vUv.x * 10.0) / 10.0 * ceil(vUv.y * 10.0) / 10.0;
        float hue  = 0.5 + strength * 0.5;

        vec3 color = hsl2rgb(hue, 0.5, 0.5);

        gl_FragColor = vec4(color, 1.0);
    }
`
