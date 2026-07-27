use crate::config::Theme;
use icondata::{ChMoon, ChSun};
use leptos::prelude::*;
use leptos_icons::Icon;

#[component]
pub fn ThemeButton() -> impl IntoView {
    let (theme, set_theme) =
        use_context::<(ReadSignal<Theme>, WriteSignal<Theme>)>().expect("to find theme context");

    view! {
        <button
            on:click=move |_| {
                set_theme
                    .update(|theme| {
                        *theme = match theme {
                            Theme::Light => Theme::Dark,
                            Theme::Dark => Theme::Light,
                        };
                    });
            }
            class="p-2 cursor-pointer transition hover:scale-110 active:scale-105 hover:opacity-75"
        >
            {move || match theme.get() {
                Theme::Light => {
                    view! { <Icon icon=ChSun/> }
                }
                Theme::Dark => {
                    view! { <Icon icon=ChMoon/> }
                }
            }}
        </button>
    }
}
