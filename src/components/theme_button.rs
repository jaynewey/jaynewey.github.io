use leptos::*;
use leptos_icons::*;
use icondata_ch::ChIcon::{ChMoon, ChSun};
use crate::config::Theme;

#[component]
pub fn ThemeButton(cx: Scope) -> impl IntoView {
    let (theme, set_theme) =
        use_context::<(ReadSignal<Theme>, WriteSignal<Theme>)>(cx).expect("to find theme context");

    view! { cx,
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
                    view! { cx, <Icon icon=ChSun/> }
                }
                Theme::Dark => {
                    view! { cx, <Icon icon=ChMoon/> }
                }
            }}
        </button>
    }
}
