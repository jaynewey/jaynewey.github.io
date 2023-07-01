use portfolio::*;

use std::sync::mpsc;

use leptos::*;

#[cfg(target_arch = "wasm32")]
fn main() {
    console_log::init_with_level(log::Level::Debug).unwrap();

    std::panic::set_hook(Box::new(console_error_panic_hook::hook));

    let (sender, receiver) = mpsc::channel();

    //run the `three-d` scene
    wasm_bindgen_futures::spawn_local(async move {
        scene::scene(receiver).await;
    });
    //mount our `leptos` app
    leptos::mount_to_body(|cx| {
        view! { cx, <App sender=sender/> }
    });
}
