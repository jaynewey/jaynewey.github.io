use crate::routes::Link;
use icondata_ch::ChIcon::{ChChevronDown, ChMapPin};
use leptos::*;
use leptos_icons::*;
use crate::components::theme_button::ThemeButton;

#[component]
pub fn Home(cx: Scope) -> impl IntoView {
    view! { cx,
        <div class="h-screen snap-start flex flex-col">
            <div class="my-auto text-center pt-8">
                <h2 class="text-7xl md:text-9xl font-bold">"jay"</h2>
                <h1 class="text-7xl md:text-9xl font-bold">"newey"</h1>
                <div class="flex flex-col items-center gap-y-2">
                    <h3 class="text-xl">"developer,"</h3>
                    <div class="flex gap-x-2 opacity-75">
                        <Icon icon=ChMapPin width="24" height="24"/>
                        <h3 class="text-xl">"west midlands, uk"</h3>
                    </div>
                </div>
                <div class="sm:hidden pt-12">
                    <ThemeButton/>
                </div>
            </div>
            <div class="mx-auto mt-auto mb-8">
                <Link path="/about">
                    <Icon icon=ChChevronDown class="animate-bounce"/>
                </Link>
            </div>
        </div>
    }
}
