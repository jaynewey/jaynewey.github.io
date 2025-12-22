pub mod about;
pub mod contact;
pub mod home;
pub mod projects;

use leptos::html;
use leptos::prelude::*;
use wasm_bindgen::prelude::*;

use crate::scene;
use std::sync::mpsc;

#[component]
pub fn Router(children: Children) -> impl IntoView {
    let (current_path, set_current_path) = signal(if let Some(window) = web_sys::window() {
        window.location().pathname().unwrap_or(String::from("/"))
    } else {
        String::from("/")
    });

    provide_context((current_path, set_current_path));

    if let Some(window) = web_sys::window() {
        if let Ok(history) = window.history() {
            let _ = history.set_scroll_restoration(web_sys::ScrollRestoration::Manual);
        }
    }

    Effect::new(move |_| {
        if let Some(window) = web_sys::window() {
            if let Ok(history) = window.history() {
                let _ = history.replace_state_with_url(
                    &js_sys::Object::new(),
                    "",
                    Some(current_path.get().as_str()),
                );
            }
        }
    });

    children()
}

#[component]
pub fn Route(path: &'static str, children: Children) -> impl IntoView {
    let div_element: NodeRef<html::Div> = NodeRef::new();

    let (_, set_current_path) = use_context::<(ReadSignal<String>, WriteSignal<String>)>()
        .expect("to find the path context");

    let (current_path, _) = use_context::<(ReadSignal<String>, WriteSignal<String>)>()
        .expect("to find the path context");

    let sender =
        use_context::<mpsc::Sender<scene::SceneStateMessage>>().expect("to find the sender");

    Effect::new(move |_| {
        if let Some(window) = web_sys::window() {
            if let Some(element) = div_element.get() {
                if window.location().pathname().unwrap_or(String::from("/")) == path {
                    let element_ = element.clone();
                    // HACK: use request_animation_frame to wait for mount
                    request_animation_frame(move || {
                        element_.scroll_into_view();
                    });
                }

                let sender = sender.clone();

                // change the path when route comes into view
                let action = Closure::<dyn Fn(JsValue)>::new(move |entries: JsValue| {
                    if let Some(entries) = entries.as_ref().dyn_ref::<js_sys::Array>() {
                        for entry in entries.iter() {
                            if let Some(entry) =
                                entry.dyn_ref::<web_sys::IntersectionObserverEntry>()
                            {
                                if entry.is_intersecting() {
                                    set_current_path.set(String::from(path));
                                    let _ = sender.send(scene::SceneStateMessage::SetCurrentPath(
                                        String::from(path),
                                    ));
                                }
                            }
                        }
                    }
                });

                let observer_options = web_sys::IntersectionObserverInit::new();
                observer_options.set_threshold(&JsValue::from_f64(0.5));

                if let Ok(observer) = web_sys::IntersectionObserver::new_with_options(
                    action.as_ref().unchecked_ref(),
                    &observer_options,
                ) {
                    observer.observe(&element);
                };
                action.forget();
            }
        }
    });

    view! {
        <div
            node_ref=div_element
            id=path
            class=("opacity-100", move || current_path.get() == path)
            class="opacity-25 transition duration-500"
        >
            {children()}
        </div>
    }
}

#[component]
pub fn Link(path: &'static str, children: Children) -> impl IntoView {
    let (current_path, _) = use_context::<(ReadSignal<String>, WriteSignal<String>)>()
        .expect("to find the path context");

    let travel = move |_| {
        if let Some(window) = web_sys::window() {
            if let Some(document) = window.document() {
                if let Some(element) = document.get_element_by_id(path) {
                    element.scroll_into_view()
                }
            }
        }
    };

    // TODO: write better regex so railwind doesn't need below
    // class="scale-110 opacity-50 opacity-100"
    view! {
        <a
            class=("scale-110", move || current_path.get() == path)
            class=("opacity-50", move || current_path.get() != path)
            class=("font-bold", move || current_path.get() == path)
            class="cursor-pointer transition hover:scale-110 active:scale-105 hover:opacity-75"
            on:click=travel
        >
            {children()}
        </a>
    }
}
