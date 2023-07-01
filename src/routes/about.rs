use leptos::*;
use icondata_ch::ChIcon::{ChGraduateCap, ChBriefcase, ChQuote};
use leptos_icons::*;


#[component]
fn Location(cx: Scope, icon: IconData, name: &'static str, date: &'static str, children: Children) -> impl IntoView {
    view! { cx,
        <li class="flex flex-col backdrop-blur-md p-4 rounded-lg">
            <div class="flex flex-col sm:flex-row items-center pb-4">
                <div class="flex gap-x-4 py-2 items-center sm:w-1/2">
                    <Icon icon=icon class="shrink-0"/>
                    <h3 class="font-bold text-xl">{name}</h3>
                </div>
                <h6 class="opacity-75 sm:ml-auto">{date}</h6>
            </div>
            <div class="ml-8">{children(cx)}</div>
        </li>
    }
}

#[component]
pub fn About(cx: Scope) -> impl IntoView {
    view! { cx,
        <div class="h-screen w-full snap-start flex flex-col lg:flex-row">
            <div class="lg:flex lg:w-1/3 lg:mr-6 p-6">
                <h2 class="font-bold text-6xl lg:text-8xl m-auto">"about"</h2>
            </div>
            <div class="overflow-y-auto space-y-6 m-6 md:m-12 md:my-auto">
                <div class="flex gap-x-4 backdrop-blur-md p-4 rounded-lg">
                    <Icon icon=ChQuote class="shrink-0"/>
                    <p>
                        "i am interested in developing all kinds of software.
                        i enjoy using open-source software, and unix-based operating systems (mostly gnu/linux).
                        in my free time I enjoy running, playing football, and programming. "
                    </p>
                </div>
                <div>
                    <div class="lg:w-3/4 ml-auto">
                        <h3 class="font-bold mb-2">"education"</h3>
                        <Location
                            icon=ChGraduateCap.into()
                            name="University of Birmingham"
                            date="2019 - 2023"
                        >
                            <h4 class="text-lg">"BSc Computer Science"</h4>
                            <h5 class="opacity-75">"First Class Honours"</h5>
                        </Location>
                        <h3 class="font-bold mt-6 mb-2">"experience"</h3>
                        <Location icon=ChBriefcase.into() name="Vodafone UK" date="2019 - Present">
                            <h4 class="text-lg">"Insights & Data Analyst Intern"</h4>
                            <h5 class="opacity-75 mb-6">"2022"</h5>
                            <h4 class="text-lg">"Network Analytics Specialist"</h4>
                            <h5 class="opacity-75">"2019"</h5>
                        </Location>
                    </div>
                </div>
            </div>
        </div>
    }
}
