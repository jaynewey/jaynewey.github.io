pub mod about;
pub mod contact;
pub mod home;
pub mod projects;

use leptos::*;
use wasm_bindgen::prelude::*;

use crate::scene;
use std::sync::mpsc;

#[component]
pub fn Router(cx: Scope, children: Children) -> impl IntoView {
    let (current_path, set_current_path) = create_signal(
        cx,
        if let Some(window) = web_sys::window() {
            window.location().pathname().unwrap_or(String::from("/"))
        } else {
            String::from("/")
        },
    );

    provide_context(cx, (current_path, set_current_path));

    if let Some(window) = web_sys::window() {
        if let Ok(history) = window.history() {
            let _ = history.set_scroll_restoration(web_sys::ScrollRestoration::Manual);
        }
    }

    create_effect(cx, move |_| {
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

    children(cx)
}

#[component]
pub fn Route(cx: Scope, path: &'static str, children: Children) -> impl IntoView {
    let div_element: NodeRef<html::Div> = create_node_ref(cx);
    let path_ = path.clone();

    let (_, set_current_path) = use_context::<(ReadSignal<String>, WriteSignal<String>)>(cx)
        .expect("to find the path context");

    let (current_path, _) = use_context::<(ReadSignal<String>, WriteSignal<String>)>(cx)
        .expect("to find the path context");

    let sender =
        use_context::<mpsc::Sender<scene::SceneStateMessage>>(cx).expect("to find the sender");

    create_effect(cx, move |_| {
        if let Some(window) = web_sys::window() {
            if let Some(element) = div_element.get() {
                if window.location().pathname().unwrap_or(String::from("/")) == path_ {
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
                                    set_current_path(String::from(path));
                                    let _ = sender.send(scene::SceneStateMessage::SetCurrentPath(
                                        String::from(path),
                                    ));
                                }
                            }
                        }
                    }
                });

                let mut observer_options = web_sys::IntersectionObserverInit::new();
                observer_options.threshold(&JsValue::from_f64(0.5));

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

    view! { cx,
        <div
            ref=div_element
            id=path
            class=("opacity-100", move || current_path.get() == path)
            class="opacity-25 transition duration-500"
        >
            {children(cx)}
        </div>
    }
}

#[component]
pub fn Link(cx: Scope, path: &'static str, children: Children) -> impl IntoView {
    let (current_path, _) = use_context::<(ReadSignal<String>, WriteSignal<String>)>(cx)
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
    view! { cx,
        <a
            class=("scale-110", move || current_path.get() == path)
            class=("opacity-50", move || current_path.get() != path)
            class=("font-bold", move || current_path.get() == path)
            class="cursor-pointer transition hover:scale-110 active:scale-105 hover:opacity-75"
            on:click=travel
        >
            {children(cx)}
        </a>
    }
}
