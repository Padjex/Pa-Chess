varying vec2 vUv;

void main()
{
    // float strength = 1.0 - step(0.44,(distance(vUv, vec2(0.5))));
    float strength =step(0.8,1.2- (distance(vUv, vec2(0.5))));
    // float strength = distance(vUv,vec2(0.5));
    vec3 blackColor = vec3(0.0);
    vec3 uvColor = vec3(vUv,0.3);
    vec3 mixColor = mix(blackColor,uvColor,strength);
    gl_FragColor =vec4(mixColor.r+0.8,mixColor.g+0.4,mixColor.b,strength-0.44);

    // gl_FragColor = vec4(0.9, 0.8, 0.5, strength - 0.4);
    // gl_FragColor = vec4(strength, strength, strength, 1.0);
}