/**
 * Common tools that can be used for rendering with Cocos2d-JS.
 * @class CocosTools
 * @memberof gdjs
 */
gdjs.CocosTools = function() {
};

/**
 * @memberof gdjs.CocosTools
 */
gdjs.CocosTools.hexToCCColor = function(hexColor, opacity) {
    return cc.color(
        (hexColor >> 16) & 255,
        (hexColor >> 8) & 255,
        (hexColor) & 255,
        opacity
    );
}

/**
 * @memberof gdjs.CocosTools
 */
gdjs.CocosTools.isHTML5 = function() {
    return (typeof document !== "undefined");
}

//TODO: move the rest to cocos-shader-tools

/**
 * @memberof gdjs.CocosTools
 */
gdjs.CocosTools.getDefaultVertexShader = function() {
    var projectionMatrix = gdjs.CocosTools.isHTML5() ?
        "(CC_PMatrix * CC_MVMatrix)" :
        "CC_PMatrix";

    return 'attribute vec4 a_position;\n'
        + 'attribute vec2 a_texCoord;\n'
        + 'attribute vec4 a_color;\n'
        + '\n'
        + "\n#ifdef GL_ES\n\n"
        + "varying lowp vec4 v_fragmentColor;\n"
        + "varying mediump vec2 v_texCoord;\n"
        + "\n#else\n\n"
        + "varying vec4 v_fragmentColor;\n"
        + "varying vec2 v_texCoord;\n"
        + "\n#endif\n\n"
        + '\n'
        + 'void main()\n'
        + '{\n'
        + '    gl_Position = ' + projectionMatrix + ' * a_position;\n'
        + '    v_fragmentColor = a_color;\n'
        + '    v_texCoord = a_texCoord;\n'
        + '}\n';
}

/**
 * @memberof gdjs.CocosTools
 */
gdjs.CocosTools.makeNightShader = function() {
    var shader = new cc.GLProgram();

    shader.initWithString(gdjs.CocosTools.getDefaultVertexShader(),
        "#ifdef GL_ES\n"
        + "precision lowp float;\n"
        + "#endif \n"
        + '\n'
        + "varying vec2 v_texCoord; \n"
        + 'uniform float intensity;\n'
        + 'uniform float opacity;\n'
        + '\n'
        + '\n'
        + 'void main(void)\n'
        + '{\n'
        + '   mat3 nightMatrix = mat3(-2.0 * intensity, -1.0 * intensity, 0, -1.0 * intensity, 0, 1.0 * intensity, 0, 1.0 * intensity, 2.0 * intensity);\n'
        + '   gl_FragColor = texture2D(CC_Texture0, v_texCoord);\n'
        + '   gl_FragColor.rgb = mix(gl_FragColor.rgb, nightMatrix * gl_FragColor.rgb, opacity);\n'
        + '}\n'
    );

    shader.addAttribute("a_position", 0);
    shader.addAttribute("a_color", 1);
    shader.addAttribute("a_texCoord", 2);
    shader.link();
    shader.updateUniforms();

    return shader;
}

/**
 * @memberof gdjs.CocosTools
 */
gdjs.CocosTools.makeLightNightShader = function() {
    var shader = new cc.GLProgram();

    shader.initWithString(gdjs.CocosTools.getDefaultVertexShader(),
        "#ifdef GL_ES\n"
        + "precision lowp float;\n"
        + "#endif \n"
        + '\n'
        + "varying vec2 v_texCoord; \n"
        + 'uniform float opacity;\n'
        + '\n'
        + '\n'
        + 'void main(void)\n'
        + '{\n'
        + '   mat3 nightMatrix = mat3(0.6, 0, 0, 0, 0.7, 0, 0, 0, 1.3);\n'
        + '   gl_FragColor = texture2D(CC_Texture0, v_texCoord);\n'
        + '   gl_FragColor.rgb = mix(gl_FragColor.rgb, nightMatrix * gl_FragColor.rgb, opacity);\n'
        + '}\n'
    );

    shader.addAttribute("a_position", 0);
    shader.addAttribute("a_color", 1);
    shader.addAttribute("a_texCoord", 2);
    shader.link();
    shader.updateUniforms();

    return shader;
}

/**
 * @memberof gdjs.CocosTools
 */
gdjs.CocosTools.makeSepiaShader = function() {
    var shader = new cc.GLProgram();

    shader.initWithString(gdjs.CocosTools.getDefaultVertexShader(),
        "#ifdef GL_ES\n"
        + "precision lowp float;\n"
        + "#endif \n"
        + '\n'
        + "varying vec2 v_texCoord; \n"
        + 'uniform float opacity;\n'
        + '\n'
        + 'const mat3 sepiaMatrix = mat3(0.3588, 0.7044, 0.1368, 0.2990, 0.5870, 0.1140, 0.2392, 0.4696, 0.0912);\n'
        + '\n'
        + 'void main(void)\n'
        + '{\n'
        + '   gl_FragColor = texture2D(CC_Texture0, v_texCoord);\n'
        + '   gl_FragColor.rgb = mix( gl_FragColor.rgb, gl_FragColor.rgb * sepiaMatrix, opacity);\n'
        + '}\n'
    );

    shader.addAttribute("a_position", 0);
    shader.addAttribute("a_color", 1);
    shader.addAttribute("a_texCoord", 2);
    shader.link();
    shader.updateUniforms();

    return shader;
}

/**
 * Create a shader that can be applied on a cc.Sprite to make it tiled.
 * You have to apply the shader with `setShaderProgram` and make sure to update
 * the shaders uniforms: uPixelSize (using texture size), uFrame
 * and uTransform (using texture and object size).
 *
 * @memberof gdjs.CocosTools
 */
gdjs.CocosTools.makeTilingShader = function() {
    var shader = new cc.GLProgram();

    var projectionMatrix = gdjs.CocosTools.isHTML5() ?
        "(CC_PMatrix * CC_MVMatrix)" :
        "CC_PMatrix";
    shader.initWithString(
        "#ifdef GL_ES\n"
        + "precision lowp float;\n"
        + "#endif \n"
        + "attribute vec4 a_position;\n"
        + "attribute vec2 a_texCoord;\n"
        + "attribute vec4 a_color;\n"
        + "\n"
        + "\n#ifdef GL_ES\n\n"
        + "varying lowp vec4 v_fragmentColor;\n"
        + "varying mediump vec2 v_texCoord;\n"
        + "\n#else\n\n"
        + "varying vec4 v_fragmentColor;\n"
        + "varying vec2 v_texCoord;\n"
        + "\n#endif\n\n"
        + "uniform vec4 uTransform; \n"
        + "uniform vec4 uFrame; \n"
        + "uniform vec2 uPixelSize; \n"
        + "\n"
        + 'void main(void){'
        + "    gl_Position = " + projectionMatrix + " * a_position;\n"

        + '   vec2 coord = a_texCoord;'
        + '   coord -= uTransform.xy;'
        + '   coord /= uTransform.zw;'
        + '   v_texCoord = coord;'

        + "    v_fragmentColor = a_color;\n"
        + '}'
        ,
        "#ifdef GL_ES\n"
        + "precision lowp float;\n"
        + "#endif \n"
        + "varying vec4 v_fragmentColor; \n"
        + "varying vec2 v_texCoord; \n"
        + "uniform vec4 uFrame; \n"
        + "uniform vec2 uPixelSize; \n"
        + "void main() \n"
        + "{ \n"
        + '   vec2 coord = mod(v_texCoord, uFrame.zw);'
        + '   coord = clamp(coord, uPixelSize, uFrame.zw - uPixelSize);'
        + '   coord += uFrame.xy;'
        + '   gl_FragColor =  texture2D(CC_Texture0, coord) * v_fragmentColor ;'
        + "}"
        );

    shader.addAttribute("a_position", 0);
    shader.addAttribute("a_color", 1);
    shader.addAttribute("a_texCoord", 2);
    shader.link();
    shader.updateUniforms();

    return shader;
}

gdjs.CocosTools._effects = {
    Night: {
        makeShader: gdjs.CocosTools.makeNightShader,
        uniformNames: ['opacity', 'intensity'],
    },
    LightNight: {
        makeShader: gdjs.CocosTools.makeLightNightShader,
        uniformNames: ['opacity'],
    },
    Sepia: {
        makeShader: gdjs.CocosTools.makeSepiaShader,
        uniformNames: ['opacity'],
    },
};

/**
 * Get the shader and its uniforms name for an effect
 * @memberof gdjs.CocosTools
 */
gdjs.CocosTools.getEffect = function(effectType) {
    if (gdjs.CocosTools._effects.hasOwnProperty(effectType))
        return gdjs.CocosTools._effects[effectType];

    return null;
}

/**
 * @memberof gdjs.CocosTools
 */
gdjs.CocosTools.setUniformLocationWith1f = function(node, shader, uniform, uniformName, value) {
    if (gdjs.CocosTools.isHTML5()) {
        shader.setUniformLocationWith1f(uniform, value);
    } else {
        node.getGLProgramState().setUniformFloat(uniformName, value);
    }
}

/**
 * @memberof gdjs.CocosTools
 */
gdjs.CocosTools.setUniformLocationWith2f = function(node, shader, uniform, uniformName, p1, p2) {
    if (gdjs.CocosTools.isHTML5()) {
        shader.setUniformLocationWith2f(uniform, p1, p2);
    } else {
        node.getGLProgramState().setUniformVec2(uniformName, cc.p(p1, p2));
    }
}

/**
 * @memberof gdjs.CocosTools
 */
gdjs.CocosTools.setUniformLocationWith4f = function(node, shader, uniform, uniformName, p1, p2, p3, p4) {
    if (gdjs.CocosTools.isHTML5()) {
        shader.setUniformLocationWith4f(uniform, p1, p2, p3, p4);
    } else {
        node.getGLProgramState().setUniformVec4(uniformName, {x: p1, y: p2, z: p3, w: p4});
    }
}
