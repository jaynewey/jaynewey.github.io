#![allow(non_snake_case)]

pub mod scene;

pub mod components;
use crate::components::bar::*;
pub mod routes;
use crate::routes::about::*;
use crate::routes::contact::*;
use crate::routes::home::*;
use crate::routes::projects::*;
use crate::routes::*;

pub mod clouds;
pub mod config;
use crate::config::Theme;

use leptos::prelude::*;

use std::sync::mpsc;

#[component]
pub fn App(sender: mpsc::Sender<scene::SceneStateMessage>) -> impl IntoView {
    let window = web_sys::window().expect("to have window");
    let (theme, set_theme) = signal(
        // remember what the user chose in local storage
        match window
            .local_storage()
            .unwrap()
            .unwrap()
            .get("theme")
            .unwrap()
            .as_deref()
        {
            Some("Dark") => Theme::Dark,
            Some("Light") => Theme::Light,
            // if we don't have a local storage option, use prefers-color-scheme
            _ => {
                if window
                    .match_media("(prefers-color-scheme: dark)")
                    .expect("media queries")
                    .unwrap()
                    .matches()
                {
                    Theme::Dark
                } else {
                    Theme::Light
                }
            }
        },
    );

    provide_context((theme, set_theme));
    provide_context(sender.clone());

    Effect::new(move |_| {
        sender
            .send(scene::SceneStateMessage::SetTheme(theme.get()))
            .unwrap();
        let _ = window
            .local_storage()
            .unwrap()
            .unwrap()
            .set("theme", &format!("{:?}", theme.get()));
        if let Some(document) = window.document() {
            if let Some(body) = document.body() {
                body.set_class_name(match theme.get() {
                    Theme::Light => "",
                    Theme::Dark => "dark",
                })
            }
        }
    });

    view! {
        <div class="text-sky-900 dark:text-sky-100 flex font-mono">
            <Router>
                <Bar />
                <div class="flex flex-col grow">
                    <Route path="/">
                        <Home />
                    </Route>
                    <Route path="/about">
                        <About />
                    </Route>
                    <Route path="/projects">
                        <Projects />
                    </Route>
                    <Route path="/contact">
                        <Contact />
                    </Route>
                </div>
            </Router>
        </div>
    }
}
