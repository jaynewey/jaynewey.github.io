use three_d::Color;

#[derive(Clone, PartialEq, Debug)]
pub enum Theme {
    Light,
    Dark,
}

pub const SUN: Color = Color {
    r: 255,
    g: 251,
    b: 235,
    a: 255,
};

pub const MOON: Color = Color {
    r: 153,
    g: 246,
    b: 228,
    a: 255,
};

pub const BACKGROUND_LIGHT: Color = Color {
    r: 186,
    g: 230,
    b: 253,
    a: 255,
};
pub const BACKGROUND_DARK: Color = Color {
    r: 30,
    g: 41,
    b: 59,
    a: 255,
};

pub const PAN_FREEDOM: f32 = 2000.0; // how far in each direction the user can pan
pub const PAN_SPEED: f32 = 0.02; // how fast the camera pans towards the cursor

pub const MOVE_SPEED: f32 = 0.02;
pub const MOVE_RESISTANCE: f32 = 0.99;

pub const MIN_CHANGE: f32 = 0.02;
