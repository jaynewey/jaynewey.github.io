use leptos::*;

#[component]
pub fn Logo(cx: Scope) -> impl IntoView {
    // TODO: reduce duplication between this as index.html
    view! { cx,
        <svg width="36" height="36" version="1.1" viewBox="0 0 68.184 70.245">
            <g transform="translate(-6.355 -5.3051)">
                <path
                    fill="currentColor"
                    d="m69.444 5.3051c-4.47-0.01166-6.4328 5.4124-9.5594 9.9709-5.7418 8.3716-19.762 26.033-19.762 26.033s0.37975-5.8906 1.7099-11.591c1.3301-5.7006 10.261-15.582 4.9408-15.202-5.3205 0.38003-7.0307 2.2802-25.843 14.441-18.812 12.161-11.211 17.102-11.211 17.102 3.6775 1.9799 9.4218-3.5871 11.323-5.2638 3.9651-3.4963 15.469-15.828 15.469-15.828s0.31469 0.46814-1.9002 4.3706c-5.0907 8.9694-12.921 15.961-17.862 20.522-4.9405 4.5605-15.202 15.392-7.7908 18.812 7.4108 3.4203 13.987-11.479 15.202-13.491 1.3762-2.2802 8.7408-11.211 8.7408-11.211s-0.76016 4.3703-2.6604 11.021c-1.9002 6.6507-4.5601 18.432 3.9907 20.332 8.5509 1.9002 12.351-8.7412 8.7409-7.9811-3.6104 0.7601-3.6105-6.2704-2.4704-11.971 1.1401-5.7006 7.0307-14.061 11.591-19.192 4.5605-5.1305 7.9809-7.0308 14.062-12.351 6.0806-5.3205 11.971-15.772 5.7006-18.052-0.8818-0.32065-1.6805-0.46799-2.412-0.46992z"
                ></path>
            </g>
        </svg>
    }
}
