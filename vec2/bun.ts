///<reference types="bun-types" />

import { dlopen, FFIType, suffix } from 'bun:ffi'

const { f32, pointer } = FFIType;

const libPath = new URL(`./target/release/libvec2.${suffix}`, import.meta.url);

export const { symbols } = dlopen(libPath, {
    vec2_new: {
        args: [f32, f32],
        returns: pointer,
    },
    vec2_free: {
        args: [pointer],
        returns: 'void',
    },
    vec2_abs: {
        args: [pointer],
        returns: pointer,
    },
    vec2_add: {
        args: [pointer, pointer],
        returns: pointer,
    },
    vec2_distance: {
        args: [pointer, pointer],
        returns: f32,
    },
    vec2_distance_squared: {
        args: [pointer, pointer],
        returns: f32,
    },
    vec2_div: {
        args: [pointer, pointer],
        returns: pointer,
    },
    vec2_dot: {
        args: [pointer, pointer],
        returns: f32,
    },
    vec2_get_x: {
        args: [pointer],
        returns: f32,
    },
    vec2_get_y: {
        args: [pointer],
        returns: f32,
    },
    vec2_length: {
        args: [pointer],
        returns: f32,
    },
    vec2_length_squared: {
        args: [pointer],
        returns: f32,
    },
    vec2_lerp: {
        args: [pointer, pointer, f32],
        returns: pointer,
    },
    vec2_max: {
        args: [pointer, pointer],
        returns: pointer,
    },
    vec2_min: {
        args: [pointer, pointer],
        returns: pointer,
    },
    vec2_move_towards: {
        args: [pointer, pointer, f32],
        returns: pointer,
    },
    vec2_mul: {
        args: [pointer, pointer],
        returns: pointer,
    },
    vec2_normalize: {
        args: [pointer],
        returns: pointer,
    },
    vec2_perp: {
        args: [pointer],
        returns: pointer,
    },
    vec2_project_onto: {
        args: [pointer, pointer],
        returns: pointer,
    },
    vec2_project_onto_normalized: {
        args: [pointer, pointer],
        returns: pointer,
    },
    vec2_reject_from: {
        args: [pointer, pointer],
        returns: pointer,
    },
    vec2_reject_from_normalized: {
        args: [pointer, pointer],
        returns: pointer,
    },
    vec2_rem: {
        args: [pointer, pointer],
        returns: pointer,
    },
    vec2_set_x: {
        args: [pointer, f32],
        returns: 'void',
    },
    vec2_set_y: {
        args: [pointer, f32],
        returns: 'void',
    },
    vec2_sub: {
        args: [pointer, pointer],
        returns: pointer,
    }
});
