const SUPABASE_URL = "https://cqlqycjmoiuwtdmezprn.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbHF5Y2ptb2l1d3RkbWV6cHJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU3NjQ0MjMsImV4cCI6MjExMTM0MDQyM30.s0eHZ3b5kjFn_pP6fYi1EZYmMTG341zXmWmSDYWaOhE";

const supabaseClient = window.supabase
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;
const signupForm = document.querySelector("#signup-form");
const loginForm = document.querySelector("#login-form");
const toast = document.querySelector("#toast");
const signupView = document.querySelector("#signup-view");
const loginView = document.querySelector("#login-view");

function showToast(message, isError = false) {
    toast.textContent = message;
    toast.classList.toggle("error", isError);
    toast.classList.add("show");
    window.clearTimeout(showToast.timeout);
    showToast.timeout = window.setTimeout(() => {
        toast.classList.remove("show", "error");
    }, 6000);
}

function getSupabaseClient() {
    if (!supabaseClient) {
        throw new Error("Unable to load the sign-in service. Check your connection and try again.");
    }

    return supabaseClient;
}

function setButtonBusy(button, isBusy, label) {
    if (!button.dataset.defaultMarkup) {
        button.dataset.defaultMarkup = button.innerHTML;
    }

    button.disabled = isBusy;
    if (isBusy) {
        button.textContent = label;
    } else {
        button.innerHTML = button.dataset.defaultMarkup;
    }
}

document.querySelectorAll("[data-password-toggle]").forEach((toggle) => {
    toggle.addEventListener("click", () => {
        const passwordInput = document.getElementById(toggle.dataset.passwordToggle);
        const willShow = passwordInput.type === "password";
        passwordInput.type = willShow ? "text" : "password";
        toggle.setAttribute("aria-pressed", String(willShow));
        toggle.setAttribute("aria-label", willShow ? "Hide password" : "Show password");
    });
});

document.querySelectorAll("[data-auth-switch]").forEach((link) => {
    link.addEventListener("click", (event) => {
        event.preventDefault();
        const showLogin = link.dataset.authSwitch === "login";
        signupView.hidden = showLogin;
        loginView.hidden = !showLogin;
        window.location.hash = showLogin ? "login" : "signup";
        (showLogin ? loginForm : signupForm).querySelector("input").focus();
    });
});

if (window.location.hash === "#login") {
    signupView.hidden = true;
    loginView.hidden = false;
}

signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!signupForm.reportValidity()) return;

    const formData = new FormData(signupForm);
    const submitButton = signupForm.querySelector(".submit");
    setButtonBusy(submitButton, true, "Creating account...");
    toast.classList.remove("show", "error");

    try {
        const { data, error } = await getSupabaseClient().auth.signUp({
            email: String(formData.get("email")).trim(),
            password: String(formData.get("password")),
            options: {
                data: {
                    first_name: String(formData.get("firstName")).trim(),
                    last_name: String(formData.get("lastName")).trim(),
                    mbti: String(formData.get("mbti"))
                }
            }
        });

        if (error) throw error;

        showToast(data.session
            ? "Your account and CareerVerse profile are ready."
            : `Account created! Check ${String(formData.get("email")).trim()} for a confirmation link.`);
        signupForm.reset();
    } catch (error) {
        showToast(error instanceof Error ? error.message : "Unable to create your account. Please try again.", true);
    } finally {
        setButtonBusy(submitButton, false, "Creating account...");
    }
});

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!loginForm.reportValidity()) return;

    const formData = new FormData(loginForm);
    const submitButton = loginForm.querySelector(".submit");
    setButtonBusy(submitButton, true, "Logging in...");
    toast.classList.remove("show", "error");

    try {
        const { error } = await getSupabaseClient().auth.signInWithPassword({
            email: String(formData.get("email")).trim(),
            password: String(formData.get("password"))
        });

        if (error) throw error;
        showToast("You're signed in. Welcome back!");
    } catch (error) {
        showToast(error instanceof Error ? error.message : "Unable to log in. Please try again.", true);
    } finally {
        setButtonBusy(submitButton, false, "Logging in...");
    }
});

document.querySelectorAll("[data-google-signin]").forEach((button) => {
    button.addEventListener("click", async () => {
        setButtonBusy(button, true, "Connecting to Google...");
        toast.classList.remove("show", "error");

        try {
            const { error } = await getSupabaseClient().auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${window.location.origin}${window.location.pathname}`
                }
            });

            if (error) throw error;
        } catch (error) {
            showToast(error instanceof Error ? error.message : "Unable to connect with Google. Please try again.", true);
            setButtonBusy(button, false, "Connecting to Google...");
        }
    });
});

const authCallbackParams = new URLSearchParams(window.location.search);
const authError = authCallbackParams.get("error_description") || authCallbackParams.get("error");
if (authError) {
    showToast(authError, true);
} else if (supabaseClient && (authCallbackParams.has("code") || window.location.hash.includes("access_token="))) {
    supabaseClient.auth.getSession()
        .then(({ data, error }) => {
            if (error) {
                showToast(error.message, true);
            } else if (data.session) {
                showToast("You're signed in. Welcome to CareerVerse!");
            }
        })
        .catch((error) => {
            showToast(error instanceof Error ? error.message : "Unable to complete sign-in. Please try again.", true);
        });
}
