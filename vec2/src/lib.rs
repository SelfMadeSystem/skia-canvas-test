use glam::Vec2;
use std::ffi::c_void;

// Getter macro: read a field from Vec2, return f32
macro_rules! getter {
    ($name:ident, $field:ident) => {
        #[unsafe(no_mangle)]
        pub extern "C" fn $name(ptr: *const c_void) -> f32 {
            if ptr.is_null() {
                0.0
            } else {
                unsafe { (*(ptr as *const Vec2)).$field }
            }
        }
    };
}

// Setter macro: write a field to Vec2
macro_rules! setter {
    ($name:ident, $field:ident) => {
        #[unsafe(no_mangle)]
        pub extern "C" fn $name(ptr: *mut c_void, value: f32) {
            if !ptr.is_null() {
                unsafe { (*(ptr as *mut Vec2)).$field = value }
            }
        }
    };
}

// Binary op macro: takes two Vec2 pointers, returns a new Vec2 pointer
macro_rules! binary_op {
    ($name:ident, $op:tt) => {
        #[unsafe(no_mangle)]
        pub extern "C" fn $name(a: *const c_void, b: *const c_void) -> *mut c_void {
            if a.is_null() || b.is_null() {
                return std::ptr::null_mut();
            }
            let res = unsafe {
                let ra = &*(a as *const Vec2);
                let rb = &*(b as *const Vec2);
                Box::new(*ra $op *rb)
            };
            Box::into_raw(res) as *mut c_void
        }
    };
}

// Binary fn macro: takes two Vec2 pointers, returns a new Vec2 pointer by calling a method
macro_rules! binary_fn {
    ($name:ident, $method:ident) => {
        #[unsafe(no_mangle)]
        pub extern "C" fn $name(a: *const c_void, b: *const c_void) -> *mut c_void {
            if a.is_null() || b.is_null() {
                return std::ptr::null_mut();
            }
            let res = unsafe {
                let ra = &*(a as *const Vec2);
                let rb = &*(b as *const Vec2);
                Box::new(ra.$method(*rb))
            };
            Box::into_raw(res) as *mut c_void
        }
    };
}

// Scalar binary op macro: takes two Vec2 pointers, returns f32
macro_rules! scalar_binary_op {
    ($name:ident, $method:ident) => {
        #[unsafe(no_mangle)]
        pub extern "C" fn $name(a: *const c_void, b: *const c_void) -> f32 {
            if a.is_null() || b.is_null() {
                return 0.0;
            }
            unsafe {
                let ra = &*(a as *const Vec2);
                let rb = &*(b as *const Vec2);
                ra.$method(*rb)
            }
        }
    };
}

// Unary op macro: takes one Vec2 pointer, returns a new Vec2 pointer
macro_rules! unary_op {
    ($name:ident, $method:ident) => {
        #[unsafe(no_mangle)]
        pub extern "C" fn $name(a: *const c_void) -> *mut c_void {
            if a.is_null() {
                return std::ptr::null_mut();
            }
            let res = unsafe {
                let ra = &*(a as *const Vec2);
                Box::new(ra.$method())
            };
            Box::into_raw(res) as *mut c_void
        }
    };
}

// Scalar unary op macro: takes one Vec2 pointer, returns f32
macro_rules! scalar_unary_op {
    ($name:ident, $method:ident) => {
        #[unsafe(no_mangle)]
        pub extern "C" fn $name(a: *const c_void) -> f32 {
            if a.is_null() {
                0.0
            } else {
                unsafe { (*(a as *const Vec2)).$method() }
            }
        }
    };
}

// Binary fn with scalar macro: takes two Vec2 pointers and an f32, returns a new Vec2 pointer
macro_rules! binary_fn_scalar {
    ($name:ident, $method:ident) => {
        #[unsafe(no_mangle)]
        pub extern "C" fn $name(a: *const c_void, b: *const c_void, s: f32) -> *mut c_void {
            if a.is_null() || b.is_null() {
                return std::ptr::null_mut();
            }
            let res = unsafe {
                let ra = &*(a as *const Vec2);
                let rb = &*(b as *const Vec2);
                Box::new(ra.$method(*rb, s))
            };
            Box::into_raw(res) as *mut c_void
        }
    };
}

#[unsafe(no_mangle)]
pub extern "C" fn vec2_new(x: f32, y: f32) -> *mut c_void {
    let v = Box::new(Vec2::new(x, y));
    Box::into_raw(v) as *mut c_void
}

#[unsafe(no_mangle)]
pub extern "C" fn vec2_free(ptr: *mut c_void) {
    if !ptr.is_null() {
        unsafe {
            let _ = Box::from_raw(ptr as *mut Vec2);
        }
    }
}

getter!(vec2_get_x, x);
getter!(vec2_get_y, y);
setter!(vec2_set_x, x);
setter!(vec2_set_y, y);

binary_op!(vec2_add, +);
binary_op!(vec2_sub, -);
binary_op!(vec2_mul, *);
binary_op!(vec2_div, /);
binary_op!(vec2_rem, %);

binary_fn!(vec2_min, min);
binary_fn!(vec2_max, max);
binary_fn!(vec2_project_onto, project_onto);
binary_fn!(vec2_project_onto_normalized, project_onto_normalized);
binary_fn!(vec2_reject_from, reject_from);
binary_fn!(vec2_reject_from_normalized, reject_from_normalized);

binary_fn_scalar!(vec2_lerp, lerp);
binary_fn_scalar!(vec2_move_towards, move_towards);

scalar_binary_op!(vec2_dot, dot);
scalar_binary_op!(vec2_distance, distance);
scalar_binary_op!(vec2_distance_squared, distance_squared);

scalar_unary_op!(vec2_length, length);
scalar_unary_op!(vec2_length_squared, length_squared);

unary_op!(vec2_normalize, normalize);
unary_op!(vec2_perp, perp);
unary_op!(vec2_abs, abs);

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn create_and_ops() {
        let a = vec2_new(1.0, 2.0);
        let b = vec2_new(3.0, 4.0);
        let c = vec2_add(a, b);
        let dx = vec2_get_x(c);
        let dy = vec2_get_y(c);
        assert_eq!(dx, 4.0);
        assert_eq!(dy, 6.0);
        assert_eq!(vec2_dot(a, b), 11.0);
        vec2_free(a);
        vec2_free(b);
        vec2_free(c);
    }
}
