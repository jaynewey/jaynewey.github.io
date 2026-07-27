use icondata::{ChGithub, ChLinkExternal};
use leptos::prelude::*;
use leptos_icons::Icon;

#[component]
fn Project(
    name: &'static str,
    date: &'static str,
    info: &'static str,
    link: Option<&'static str>,
    repo: Option<&'static str>,
) -> impl IntoView {
    view! {
        <li class="flex flex-col backdrop-blur-md p-4 rounded-lg snap-start">
            <div class="flex flex-row">
                <h3 class="font-bold text-xl mb-4">{name}</h3>
                <h4 class="ml-auto opacity-75">{date}</h4>
            </div>
            <p>{info}</p>
            <div class="flex flex-row gap-x-4 pt-4 ml-auto">
                {link
                    .map(|link| {
                        view! {
                            <a
                                href=link
                                target="_blank"
                                class="transition hover:scale-110 active:scale-105 opacity-75 hover:opacity-100"
                            >
                                <Icon icon=ChLinkExternal/>
                            </a>
                        }
                    })} {repo
                    .map(|repo| {
                        view! {
                            <a
                                href=repo
                                target="_blank"
                                class="transition hover:scale-110 active:scale-105 opacity-75 hover:opacity-100"
                            >
                                <Icon icon=ChGithub/>
                            </a>
                        }
                    })}
            </div>
        </li>
    }
}

#[component]
pub fn Projects() -> impl IntoView {
    view! {
        <div class="h-screen w-full snap-start flex flex-col lg:flex-row lg:flex-row-reverse">
            <div class="flex lg:w-1/2 lg:mr-6 p-6">
                <h2 class="font-bold text-6xl lg:text-8xl lg:m-auto">"projects"</h2>
            </div>
            <div class="overflow-y-auto space-y-6 m-6 md:m-12">
                <Project
                    name="Ante 0"
                    date="2026"
                    info="ante 0 is a guessing game for jokers from the video game balatro, created using vue and typescript"
                    link=Some("https://jaynewey.github.io/ante-0")
                    repo=Some("https://github.com/jaynewey/ante-0")
                />
                <Project
                    name="CodeSpecs"
                    date="2022 - 2023"
                    info="made for my university dissertation, a full-stack web application written with typescript which leverages the debug adapter protocol to produce animated visualisations of real code"
                    link=Some("http://codespecs.shah.fyi")
                    repo=None
                />
                <Project
                    name="Slinky"
                    date="2022"
                    info="slinky is a tool for visualising and creating graph data structures, written with react and typescript"
                    link=Some("https://jaynewey.github.io/slinky")
                    repo=Some("https://github.com/jaynewey/slinky")
                />
                <Project
                    name="Charm Icons"
                    date="2020 - present"
                    info="charm icons is a set of open svg icons (the ones used on this web page!) and a javascript library to handle them"
                    link=None
                    repo=Some("https://github.com/jaynewey/charm-icons")
                />
                <Project
                    name="Gust"
                    date="2023"
                    info="an open source weather application, written with rust and leptos"
                    link=Some("https://jaynewey.github.io/gust")
                    repo=Some("https://github.com/jaynewey/gust")
                />
                <Project
                    name="Bubbles"
                    date="2020"
                    info="bubbles is a simple particle system library for python programs"
                    link=None
                    repo=Some("https://github.com/jaynewey/bubbles")
                />
                <Project
                    name="This website"
                    date="2023"
                    info="my portfolio is written using rust with the leptos and three_d crates, compiled to wasm"
                    link=None
                    repo=Some("https://github.com/jaynewey/jaynewey.github.io")
                />
            </div>
        </div>
    }
}
