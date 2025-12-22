use leptos::prelude::*;

use crate::components::logo::Logo;
use crate::components::theme_button::ThemeButton;
use crate::routes::Link;

#[component]
pub fn Bar() -> impl IntoView {
    view! {
        <div class="sticky top-0 p-6 h-screen hidden sm:flex flex-col text-center">
            <Link path="/">
                <Logo/>
            </Link>
            <div class="flex flex-col grow justify-evenly py-12">
                <Link path="/about">
                    <p class="rotate-180" style="writing-mode: vertical-rl">
                        "about"
                    </p>
                </Link>
                <Link path="/projects">
                    <p class="rotate-180" style="writing-mode: vertical-rl">
                        "projects"
                    </p>
                </Link>
                <Link path="/contact">
                    <p class="rotate-180" style="writing-mode: vertical-rl">
                        "contact"
                    </p>
                </Link>
            </div>
            <ThemeButton/>
        </div>
    }
}
