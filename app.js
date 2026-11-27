const SUPABASE_URL = "https://cqlqycjmoiuwtdmezprn.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbHF5Y2ptb2l1d3RkbWV6cHJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU3NjQ0MjMsImV4cCI6MjExMTM0MDQyM30.s0eHZ3b5kjFn_pP6fYi1EZYmMTG341zXmWmSDYWaOhE";

const form = document.querySelector("#signup-form");
const passwordInput = document.querySelector("#password");
const passwordToggle = document.querySelector(".toggle-password");
const toast = document.querySelector("#toast");
const submitButton = form.querySelector(".submit");

passwordToggle.addEventListener("click", () => {
    const willShow = passwordInput.type === "password";
    passwordInput.type = willShow ? "text" : "password";
    passwordToggle.setAttribute("aria-pressed", String(willShow));
    passwordToggle.setAttribute("aria-label", willShow ? "Hide password" : "Show password");
});

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!form.reportValidity()) return;

    const formData = new FormData(form);
    const email = String(formData.get("email")).trim();
    submitButton.disabled = true;
    submitButton.textContent = "Creating account...";
    toast.classList.remove("show", "error");

    try {
        const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                apikey: SUPABASE_ANON_KEY
            },
            body: JSON.stringify({
                email,
                password: formData.get("password"),
                data: {
                    first_name: String(formData.get("firstName")).trim(),
                    last_name: String(formData.get("lastName")).trim(),
                    mbti: String(formData.get("mbti"))
                }
            })
        });

        let result;
        try {
            result = await response.json();
        } catch {
            throw new Error("Supabase returned an unreadable response. Please try again.");
        }

        if (!response.ok) {
            throw new Error(
                result.msg ||
                result.message ||
                result.error_description ||
                result.error ||
                "Unable to create your account. Please try again."
            );
        }

        toast.textContent = result.session
            ? "Your account and CareerVerse profile are ready."
            : `Account created! Check ${email} for a confirmation link.`;
        toast.classList.add("show");
        form.reset();
    } catch (error) {
        toast.textContent = error instanceof Error
            ? error.message
            : "Unable to connect to Supabase. Please try again.";
        toast.classList.add("show", "error");
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = 'Enter Dashboard <span aria-hidden="true">→</span>';
        window.setTimeout(() => toast.classList.remove("show", "error"), 6000);
    }
});