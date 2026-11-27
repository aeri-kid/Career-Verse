const SUPABASE_URL = "https://cqlqycjmoiuwtdmezprn.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbHF5Y2ptb2l1d3RkbWV6cHJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU3NjQ0MjMsImV4cCI6MjExMTM0MDQyM30.s0eHZ3b5kjFn_pP6fYi1EZYmMTG341zXmWmSDYWaOhE";

const supabaseClient = window.supabase
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;
const authShell = document.querySelector(".shell");
const workspace = document.querySelector("#workspace");
const signupForm = document.querySelector("#signup-form");
const loginForm = document.querySelector("#login-form");
const toast = document.querySelector("#toast");
const signupView = document.querySelector("#signup-view");
const loginView = document.querySelector("#login-view");
const gameDialog = document.querySelector("#game-dialog");

const careers = [
    {
        id: "product-designer",
        name: "Product Designer",
        category: "Design & Technology",
        description: "Shape easy-to-use digital products through research, creativity, and collaboration.",
        skills: "Creativity · Empathy · Problem-solving",
        path: "Design foundations → UX portfolio → Product team",
        salary: {
            "United States": { entry: 68000, mid: 102000, senior: 145000 },
            Canada: { entry: 58000, mid: 84000, senior: 116000 }
        }
    },
    {
        id: "software-engineer",
        name: "Software Engineer",
        category: "Technology",
        description: "Build and improve the software and systems people use every day.",
        skills: "Logic · Curiosity · Teamwork",
        path: "Computer science → Projects → Engineering team",
        salary: {
            "United States": { entry: 78000, mid: 122000, senior: 172000 },
            Canada: { entry: 65000, mid: 98000, senior: 138000 }
        }
    },
    {
        id: "ux-researcher",
        name: "UX Researcher",
        category: "Research & Design",
        description: "Learn what people need and turn their experiences into better products.",
        skills: "Listening · Analysis · Communication",
        path: "Psychology or design → Research practice → UX team",
        salary: {
            "United States": { entry: 65000, mid: 98000, senior: 138000 },
            Canada: { entry: 55000, mid: 80000, senior: 110000 }
        }
    },
    {
        id: "environmental-scientist",
        name: "Environmental Scientist",
        category: "Science & Sustainability",
        description: "Study the natural world and help communities make sustainable decisions.",
        skills: "Observation · Research · Problem-solving",
        path: "Science courses → Field experience → Research or policy",
        salary: {
            "United States": { entry: 51000, mid: 76000, senior: 108000 },
            Canada: { entry: 48000, mid: 70000, senior: 96000 }
        }
    }
];

const gameScenes = [
    {
        title: "A new project lands",
        description: "Your team needs to improve a confusing sign-up flow. What do you do first?",
        choices: [
            ["Talk to people who use it", "You hear the real frustrations before deciding what to change.", 2],
            ["Sketch a few possible screens", "Quick sketches make it easier for the team to explore ideas.", 1],
            ["Check the existing sign-up data", "The numbers point to where people are getting stuck.", 1]
        ]
    },
    {
        title: "Time to collaborate",
        description: "A teammate has a different idea for the first screen. How do you respond?",
        choices: [
            ["Ask them to explain their thinking", "Understanding their goal reveals a useful perspective.", 2],
            ["Make two quick versions to compare", "A small prototype gives everyone something concrete to discuss.", 1],
            ["Choose the idea that feels clearest", "A clear direction helps the team move forward.", 1]
        ]
    },
    {
        title: "A tricky discovery",
        description: "A user test shows people are still confused by your favorite design.",
        choices: [
            ["Listen and revise the design", "Good design responds to what people actually need.", 2],
            ["Ask a follow-up question", "A little more context can reveal the source of confusion.", 1],
            ["Share the result with your team", "Working together helps uncover the next step.", 1]
        ]
    },
    {
        title: "Share your progress",
        description: "Your team lead asks you to present your updated direction.",
        choices: [
            ["Walk through the user problem and your solution", "Connecting the problem to the solution makes your work easy to follow.", 2],
            ["Show the prototype and invite feedback", "A working example makes it easy for others to react.", 1],
            ["Share the key takeaways and next steps", "A concise update keeps everyone aligned.", 1]
        ]
    },
    {
        title: "Wrap up the day",
        description: "You have a few minutes to reflect before heading out.",
        choices: [
            ["Write down what you learned from users", "Reflection helps you carry useful insights into tomorrow.", 2],
            ["List the next design tasks", "A clear plan makes it easier to get started again.", 1],
            ["Thank your teammates for their input", "Good collaboration is part of great work.", 1]
        ]
    }
];

let activeSceneIndex = 0;
let gameScore = 0;

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
    button.textContent = isBusy ? label : "";
    if (!isBusy) button.innerHTML = button.dataset.defaultMarkup;
}

function showAuth() {
    workspace.hidden = true;
    authShell.hidden = false;
    document.title = "Welcome | CareerVerse";
}

function showWorkspace(user) {
    const metadata = user.user_metadata || {};
    const fullName = metadata.first_name || metadata.full_name || metadata.name
        || user.email?.split("@")[0] || "Career explorer";
    const mbti = metadata.mbti || "Career explorer";
    const initials = fullName.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

    document.querySelector("#sidebar-name").textContent = fullName;
    document.querySelector("#sidebar-mbti").textContent = mbti;
    document.querySelector("#user-avatar").textContent = initials || "U";
    document.querySelector("#topbar-avatar").textContent = initials || "U";
    document.querySelector("#topbar-greeting").textContent = `Welcome${metadata.first_name ? `, ${metadata.first_name}` : ""}`;
    document.querySelector("#home-profile-copy").textContent = mbti === "Career explorer"
        ? "Your career interests will grow as you explore."
        : `Your ${mbti} profile is a starting point for exploring careers that fit you.`;

    authShell.hidden = true;
    workspace.hidden = false;
    document.title = "CareerVerse | Discover your future";
    if (window.location.search || window.location.hash) {
        window.history.replaceState(null, "", window.location.pathname);
    }
    showPage("home");
}

function showPage(pageName) {
    document.querySelectorAll(".page-view").forEach((page) => {
        const isCurrent = page.id === `${pageName}-page`;
        page.hidden = !isCurrent;
        page.classList.toggle("active", isCurrent);
    });
    document.querySelectorAll(".side-nav [data-page-link]").forEach((link) => {
        const isCurrent = link.dataset.pageLink === pageName;
        link.classList.toggle("active", isCurrent);
        if (isCurrent) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
    });
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

        if (data.session) {
            showWorkspace(data.user);
            showToast("Your account and CareerVerse profile are ready.");
        } else {
            showToast(`Account created! Check ${String(formData.get("email")).trim()} for a confirmation link.`);
        }
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
        const { data, error } = await getSupabaseClient().auth.signInWithPassword({
            email: String(formData.get("email")).trim(),
            password: String(formData.get("password"))
        });

        if (error) throw error;
        showWorkspace(data.user);
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

document.querySelectorAll("[data-page-link]").forEach((link) => {
    link.addEventListener("click", (event) => {
        event.preventDefault();
        showPage(link.dataset.pageLink);
    });
});

function formatSalary(amount, region) {
    const currency = region === "Canada" ? "CAD" : "USD";
    return new Intl.NumberFormat("en", {
        style: "currency",
        currency,
        maximumFractionDigits: 0
    }).format(amount);
}

function getSelectedRegion() {
    return document.querySelector("#salary-region").value;
}

function renderCareers() {
    const query = document.querySelector("#career-search").value.trim().toLowerCase();
    const sort = document.querySelector("#salary-sort").value;
    const region = getSelectedRegion();
    const filteredCareers = careers
        .filter((career) => `${career.name} ${career.category} ${career.skills}`.toLowerCase().includes(query))
        .sort((first, second) => {
            if (sort === "name") return first.name.localeCompare(second.name);
            if (sort === "salary") return second.salary[region].senior - first.salary[region].senior;
            return careers.indexOf(first) - careers.indexOf(second);
        });

    document.querySelector("#career-grid").innerHTML = filteredCareers.map((career) => {
        const salary = career.salary[region];
        return `<article class="career-card">
            <div class="career-card-top"><span class="career-category">${career.category}</span><span class="career-mark" aria-hidden="true">✦</span></div>
            <h2>${career.name}</h2><p>${career.description}</p>
            <div class="salary-tiers">
                <div><small>Entry</small><strong>${formatSalary(salary.entry, region)}</strong></div>
                <div><small>Mid-level</small><strong>${formatSalary(salary.mid, region)}</strong></div>
                <div><small>Senior / Lead</small><strong>${formatSalary(salary.senior, region)}</strong></div>
            </div>
            <p class="career-skills"><strong>Strengths:</strong> ${career.skills}</p>
            <div class="career-path"><small>PATHWAY</small><p>${career.path}</p></div>
            <button type="button" class="text-action" data-compare-career="${career.id}">Add to comparison →</button>
        </article>`;
    }).join("");
    document.querySelector("#career-empty").hidden = filteredCareers.length > 0;
}

function populateComparisonSelects() {
    const options = careers.map((career) => `<option value="${career.id}">${career.name}</option>`).join("");
    document.querySelector("#compare-one").innerHTML = options;
    document.querySelector("#compare-two").innerHTML = options;
    document.querySelector("#compare-two").selectedIndex = 1;
}

function renderComparison() {
    const first = careers.find((career) => career.id === document.querySelector("#compare-one").value);
    const second = careers.find((career) => career.id === document.querySelector("#compare-two").value);
    if (!first || !second || first.id === second.id) {
        showToast("Choose two different careers to compare.", true);
        return;
    }

    const region = getSelectedRegion();
    const firstSalary = first.salary[region];
    const secondSalary = second.salary[region];
    const salaryLead = firstSalary.mid >= secondSalary.mid ? first : second;
    const comparisonResults = document.querySelector("#comparison-results");
    comparisonResults.innerHTML = `
        <div class="comparison-card"><span class="career-category">${first.category}</span><h2>${first.name}</h2><p>${first.description}</p><div class="comparison-detail"><small>Typical strengths</small><strong>${first.skills}</strong></div><div class="comparison-detail"><small>Pathway</small><strong>${first.path}</strong></div><div class="comparison-detail"><small>Mid-level salary · ${region}</small><strong>${formatSalary(firstSalary.mid, region)}</strong></div></div>
        <div class="comparison-card"><span class="career-category">${second.category}</span><h2>${second.name}</h2><p>${second.description}</p><div class="comparison-detail"><small>Typical strengths</small><strong>${second.skills}</strong></div><div class="comparison-detail"><small>Pathway</small><strong>${second.path}</strong></div><div class="comparison-detail"><small>Mid-level salary · ${region}</small><strong>${formatSalary(secondSalary.mid, region)}</strong></div></div>
        <div class="recommendation"><span aria-hidden="true">✦</span><div><strong>A helpful way to choose</strong><p>${salaryLead.name} has the higher listed mid-level salary in ${region}. Think about the day-to-day work and skills you enjoy, too—salary is only one part of a good fit.</p></div></div>`;
}

document.querySelector("#career-search").addEventListener("input", renderCareers);
document.querySelector("#salary-sort").addEventListener("change", renderCareers);
document.querySelector("#salary-region").addEventListener("change", () => {
    renderCareers();
    if (document.querySelector("#comparison-results .comparison-card")) renderComparison();
});
document.querySelector("#career-grid").addEventListener("click", (event) => {
    const button = event.target.closest("[data-compare-career]");
    if (!button) return;
    document.querySelector("#compare-one").value = button.dataset.compareCareer;
    showPage("comparison");
});
document.querySelector("#compare-button").addEventListener("click", renderComparison);
populateComparisonSelects();
renderCareers();

function renderGameScene() {
    const scene = gameScenes[activeSceneIndex];
    const isComplete = !scene;
    const progressLabel = document.querySelector("#game-progress-label");
    const progressBar = document.querySelector("#game-progress-bar");
    const sceneTitle = document.querySelector("#scene-title");
    const sceneDescription = document.querySelector("#scene-description");
    const choicesContainer = document.querySelector("#game-choices");

    if (isComplete) {
        progressLabel.textContent = "Simulation complete";
        progressBar.style.width = "100%";
        sceneTitle.textContent = "Your workday, your way";
        sceneDescription.textContent = gameScore >= 8
            ? "You made space for people, ideas, and thoughtful teamwork. Those are great foundations for exploring product design."
            : "You brought curiosity and teamwork to the day. There are many ways to make an impact in product design.";
        choicesContainer.innerHTML = '<button class="primary-action" type="button" data-restart-game>Play again <span aria-hidden="true">↻</span></button>';
        return;
    }

    progressLabel.textContent = `Scene ${activeSceneIndex + 1} of ${gameScenes.length}`;
    progressBar.style.width = `${(activeSceneIndex / gameScenes.length) * 100}%`;
    sceneTitle.textContent = scene.title;
    sceneDescription.textContent = scene.description;
    choicesContainer.innerHTML = scene.choices.map(([label], index) =>
        `<button class="game-choice" type="button" data-game-choice="${index}">${label}<span aria-hidden="true">→</span></button>`
    ).join("");
}

function openGame() {
    activeSceneIndex = 0;
    gameScore = 0;
    renderGameScene();
    gameDialog.showModal();
}

document.querySelectorAll("[data-open-game]").forEach((button) => button.addEventListener("click", openGame));
document.querySelectorAll("[data-close-game]").forEach((button) => button.addEventListener("click", () => gameDialog.close()));
document.querySelector("#game-choices").addEventListener("click", (event) => {
    const choiceButton = event.target.closest("[data-game-choice]");
    if (choiceButton) {
        gameScore += gameScenes[activeSceneIndex].choices[Number(choiceButton.dataset.gameChoice)][2];
        activeSceneIndex += 1;
        renderGameScene();
        return;
    }
    if (event.target.closest("[data-restart-game]")) openGame();
});
gameDialog.addEventListener("click", (event) => {
    if (event.target === gameDialog) gameDialog.close();
});

document.querySelector("#logout-button").addEventListener("click", async () => {
    try {
        const { error } = await getSupabaseClient().auth.signOut();
        if (error) throw error;
        showAuth();
        showToast("You've been signed out.");
    } catch (error) {
        showToast(error instanceof Error ? error.message : "Unable to sign out. Please try again.", true);
    }
});

const authCallbackParams = new URLSearchParams(window.location.search);
const authHashParams = new URLSearchParams(window.location.hash.slice(1));
const authError = authCallbackParams.get("error_description")
    || authCallbackParams.get("error")
    || authHashParams.get("error_description")
    || authHashParams.get("error");
if (authError) showToast(authError, true);

if (supabaseClient) {
    supabaseClient.auth.onAuthStateChange((event, session) => {
        if (session?.user) showWorkspace(session.user);
        else if (event === "SIGNED_OUT") showAuth();
    });
    supabaseClient.auth.getSession()
        .then(({ data, error }) => {
            if (error) {
                showToast(error.message, true);
            } else if (data.session?.user) {
                showWorkspace(data.session.user);
            }
        })
        .catch((error) => {
            showToast(error instanceof Error ? error.message : "Unable to check your sign-in. Please try again.", true);
        });
}
