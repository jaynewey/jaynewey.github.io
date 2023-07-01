use leptos::*;
use icondata_ch::ChIcon::{ChMail, ChGithub, ChBriefcase};
use leptos_icons::*;


#[component]
pub fn Link(cx: Scope, icon: IconData, text: &'static str, link: &'static str) -> impl IntoView {
    view! { cx,
        <a
            href=link
            target="_blank"
            class="flex shrink backdrop-blur-md rounded-lg transition hover:scale-110 active:scale-105 opacity-75 hover:opacity-100"
        >
            <div class="flex items-center m-6 gap-x-6">
                <Icon class="shrink-0" icon=icon width="24" height="24"/>
                <h4 class="text-lg md:text-xl mb-2 break-all">{text}</h4>
            </div>
        </a>
    }
}

#[component]
pub fn Contact(cx: Scope) -> impl IntoView {
    view! { cx,
        <div class="h-screen w-full snap-start flex flex-col lg:flex-row">
            <div class="lg:flex lg:w-1/2 lg:mr-6 p-6">
                <h2 class="font-bold text-6xl lg:text-8xl m-auto">"contact"</h2>
            </div>
            <div class="space-y-12 m-6 md:m-12 my-auto">
                <Link
                    icon=ChMail.into()
                    text="jay.newey01@gmail.com"
                    link="mailto:jay.newey01@gmail.com"
                />
                <div>
                    <h3 class="font-bold mb-2">"links"</h3>
                    <div class="space-y-6">
                        <Link
                            icon=ChGithub.into()
                            text="GitHub"
                            link="https://github.com/jaynewey"
                        />
                        <Link
                            icon=ChBriefcase.into()
                            text="LinkedIn"
                            link="https://www.linkedin.com/in/jay-newey"
                        />
                    </div>
                </div>
            </div>
        </div>
    }
}
