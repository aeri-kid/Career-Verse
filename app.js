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
const loadingScreen = document.querySelector("#loading-screen");

const fallbackCareers = [
    {
        id: "product-designer",
        slug: "product-designer",
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
        slug: "software-engineer",
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
        slug: "ux-researcher",
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
        slug: "environmental-scientist",
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

const fallbackMatchOrders = {
    analysts: ["software-engineer", "product-designer", "ux-researcher"],
    diplomats: ["ux-researcher", "product-designer", "environmental-scientist"],
    sentinels: ["software-engineer", "environmental-scientist", "ux-researcher"],
    explorers: ["product-designer", "software-engineer", "environmental-scientist"]
};
const mbtiGroups = {
    INTJ: "analysts", INTP: "analysts", ENTJ: "analysts", ENTP: "analysts",
    INFJ: "diplomats", INFP: "diplomats", ENFJ: "diplomats", ENFP: "diplomats",
    ISTJ: "sentinels", ISFJ: "sentinels", ESTJ: "sentinels", ESFJ: "sentinels",
    ISTP: "explorers", ISFP: "explorers", ESTP: "explorers", ESFP: "explorers"
};
const defaultRegions = [
    { name: "United States", currency: "USD" },
    { name: "Canada", currency: "CAD" }
];
let careers = fallbackCareers;
let careerRegions = defaultRegions;
let mbtiTypes = [];
let mbtiDataError = "";
let careerDataState = "loading";
let careerDataError = "";
let careerDataUserId = null;
let careerDataLoadPromise = null;
let activeUser = null;
let matchRequestId = 0;
let initialSessionResolved = !supabaseClient;

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

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function getRelation(value) {
    return Array.isArray(value) ? value[0] || {} : value || {};
}

function slugify(value) {
    return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function normalizeCareer(row) {
    const category = getRelation(row.categories);
    const salaryRows = Array.isArray(row.career_salaries) ? row.career_salaries : [];
    const salary = {};

    salaryRows.forEach((salaryRow) => {
        const country = getRelation(salaryRow.countries);
        if (!country.country_name) return;
        const usesMMK = country.currency_code === "MMK";
        const asAmount = (value) => value === null || value === undefined || value === "" ? null : Number(value);
        salary[country.country_name] = {
            entry: asAmount(usesMMK ? salaryRow.low_range_mmk ?? salaryRow.low_range_salary : salaryRow.low_range_salary),
            mid: asAmount(usesMMK ? salaryRow.mid_range_mmk ?? salaryRow.mid_range_salary : salaryRow.mid_range_salary),
            senior: asAmount(usesMMK ? salaryRow.high_range_mmk ?? salaryRow.high_range_salary : salaryRow.high_range_salary),
            currency: country.currency_code || "USD"
        };
    });

    return {
        id: String(row.id),
        slug: slugify(row.career_name),
        name: row.career_name,
        category: category.name || "Career",
        description: "",
        skills: "",
        path: row.education_path || "Education pathway not listed yet.",
        salary
    };
}

function updateRegionOptions() {
    const regionSelect = document.querySelector("#salary-region");
    const previousRegion = regionSelect.value;
    const regions = careerRegions.length ? careerRegions : defaultRegions;
    regionSelect.innerHTML = regions.map((region) =>
        `<option value="${escapeHTML(region.name)}">${escapeHTML(region.name)} · ${escapeHTML(region.currency)}</option>`
    ).join("");
    regionSelect.value = regions.some((region) => region.name === previousRegion)
        ? previousRegion
        : regions[0].name;
}

async function loadCareerData(userId) {
    if (!supabaseClient) {
        throw new Error("Supabase is unavailable.");
    }

    const careerQuery = supabaseClient.from("careers")
        .select("id,career_name,education_path,categories(id,name),career_salaries(low_range_salary,mid_range_salary,high_range_salary,low_range_mmk,mid_range_mmk,high_range_mmk,countries(id,country_name,currency_code,mmk_per_unit))")
        .order("career_name");
    const mbtiQuery = supabaseClient.from("mbti_types").select("id,code,title");
    const [{ data: careerRows, error: careerError }, { data: typeRows, error: typeError }] =
        await Promise.all([careerQuery, mbtiQuery]);
    if (userId !== careerDataUserId) return;

    if (typeError) {
        mbtiDataError = typeError.message;
    } else {
        mbtiTypes = typeRows || [];
    }

    if (careerError) {
        careerDataState = "error";
        careerDataError = careerError.message;
        careers = fallbackCareers;
        careerRegions = defaultRegions;
    } else if (careerRows?.length) {
        careers = careerRows.map(normalizeCareer);
        const regions = new Map();
        careerRows.forEach((career) => {
            (career.career_salaries || []).forEach((salary) => {
                const country = getRelation(salary.countries);
                if (country.country_name) {
                    regions.set(country.country_name, {
                        name: country.country_name,
                        currency: country.currency_code || "USD"
                    });
                }
            });
        });
        careerRegions = [...regions.values()];
        careerDataState = "ready";
    } else {
        careers = fallbackCareers;
        careerRegions = defaultRegions;
        careerDataState = "empty";
    }

    updateRegionOptions();
    populateComparisonSelects();
    renderCareers();
    if (activeUser) loadTopMatches(activeUser);
}

function loadCareerDataForUser(user) {
    if (!user?.id || !supabaseClient) return;
    if (careerDataUserId === user.id) return careerDataLoadPromise;

    careerDataUserId = user.id;
    careerDataState = "loading";
    careerDataError = "";
    mbtiDataError = "";
    careerDataLoadPromise = loadCareerData(user.id).catch((error) => {
        if (careerDataUserId !== user.id) return;
        careerDataState = "error";
        careerDataError = error instanceof Error ? error.message : "Unable to connect to the career database.";
        careers = fallbackCareers;
        careerRegions = defaultRegions;
        updateRegionOptions();
        populateComparisonSelects();
        renderCareers();
        if (activeUser) loadTopMatches(activeUser);
    });
    return careerDataLoadPromise;
}

function showAuth() {
    activeUser = null;
    matchRequestId += 1;
    careerDataUserId = null;
    careerDataLoadPromise = null;
    careers = fallbackCareers;
    careerRegions = defaultRegions;
    mbtiTypes = [];
    mbtiDataError = "";
    careerDataState = "loading";
    careerDataError = "";
    updateRegionOptions();
    populateComparisonSelects();
    renderCareers();
    document.querySelector("#home-mbti").value = "";
    document.querySelector("#top-matches").innerHTML = '<p class="match-state">Choose an MBTI type to see career suggestions.</p>';
    document.querySelector("#matches-summary").textContent = "Choose your MBTI type to see career suggestions.";
    workspace.hidden = true;
    authShell.hidden = false;
    document.title = "Welcome | CareerVerse";
}

function showWorkspace(user) {
    activeUser = user;
    const metadata = user.user_metadata || {};
    const fullName = metadata.first_name || metadata.full_name || metadata.name
        || user.email?.split("@")[0] || "Career explorer";
    const mbti = String(metadata.mbti || "").toUpperCase();
    const initials = fullName.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

    document.querySelector("#sidebar-name").textContent = fullName;
    document.querySelector("#sidebar-mbti").textContent = mbti || "Add your MBTI";
    document.querySelector("#user-avatar").textContent = initials || "U";
    document.querySelector("#topbar-avatar").textContent = initials || "U";
    document.querySelector("#topbar-greeting").textContent = `Welcome${metadata.first_name ? `, ${metadata.first_name}` : ""}`;
    document.querySelector("#home-profile-copy").textContent = !mbti
        ? "Your career interests will grow as you explore."
        : `Your ${mbti} profile is a starting point for exploring careers that fit you.`;
    document.querySelector("#home-mbti").value = mbti;
    document.querySelector("#matches-summary").textContent = mbti
        ? `Based on your ${mbti} personality type.`
        : "Choose your MBTI type to see career suggestions.";

    authShell.hidden = true;
    workspace.hidden = false;
    document.title = "CareerVerse | Discover your future";
    if (window.location.search || window.location.hash) {
        window.history.replaceState(null, "", window.location.pathname);
    }
    showPage("home");
    loadCareerDataForUser(user);
    loadTopMatches(user);
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

function getStarterMatches(mbti) {
    const group = mbtiGroups[mbti] || "analysts";
    const preferredSlugs = fallbackMatchOrders[group];
    const ordered = preferredSlugs.map((slug) =>
        careers.find((career) => career.slug === slug)
        || fallbackCareers.find((career) => career.slug === slug)
    ).filter(Boolean);
    const unique = [...new Map([...ordered, ...careers].map((career) => [career.slug, career])).values()];
    return unique.slice(0, 3).map((career, index) => ({
        career,
        rank: index + 1,
        reason: ""
    }));
}

function renderTopMatches(matches, status) {
    const matchContainer = document.querySelector("#top-matches");
    const matchStatus = document.querySelector("#matches-summary");
    matchStatus.textContent = status;
    if (!matches.length) {
        matchContainer.innerHTML = '<p class="match-state">Choose an MBTI type above to see your career matches.</p>';
        return;
    }

    matchContainer.innerHTML = matches.map(({ career, rank, reason }) => `
        <article class="match-card">
            <div class="match-card-top"><span class="match-rank">0${rank}</span><span class="career-category">${escapeHTML(career.category)}</span></div>
            <h3>${escapeHTML(career.name)}</h3>
            <p>${escapeHTML(reason || career.description || career.path || "Explore this career and see how it fits your interests.")}</p>
            <button type="button" class="text-action" data-match-career="${escapeHTML(career.id)}">Explore this career →</button>
        </article>`).join("");
}

async function loadTopMatches(user) {
    const requestId = ++matchRequestId;
    const mbti = String(user.user_metadata?.mbti || "").toUpperCase();
    if (!mbti) {
        renderTopMatches([], "Add your MBTI type to discover career suggestions.");
        return;
    }

    const mbtiType = mbtiTypes.find((type) => String(type.code || "").toUpperCase() === mbti);
    if (mbtiDataError) {
        const starterMatches = getStarterMatches(mbti);
        renderTopMatches(starterMatches, `Could not load MBTI data: ${mbtiDataError} Showing starter suggestions.`);
        return;
    }

    if (supabaseClient && mbtiType) {
        const { data, error } = await supabaseClient.from("mbti_career_matches")
            .select("match_rank,match_reason,careers!inner(id,career_name,education_path,categories(id,name),career_salaries(low_range_salary,mid_range_salary,high_range_salary,low_range_mmk,mid_range_mmk,high_range_mmk,countries(id,country_name,currency_code,mmk_per_unit)))")
            .eq("mbti_id", mbtiType.id)
            .order("match_rank", { ascending: true })
            .limit(3);
        if (requestId !== matchRequestId) return;
        if (error) {
            const starterMatches = getStarterMatches(mbti);
            renderTopMatches(starterMatches, `Database unavailable: ${error.message} Showing starter suggestions for ${mbti}.`);
            return;
        }
        if (data?.length) {
            const matches = data.map((match, index) => ({
                career: normalizeCareer(getRelation(match.careers)),
                rank: match.match_rank || index + 1,
                reason: match.match_reason || ""
            }));
            renderTopMatches(matches, `Top matches ranked for your ${mbti} profile.`);
            return;
        }
    }

    const starterMatches = getStarterMatches(mbti);
    const starterStatus = careerDataState === "loading"
        ? `Connecting to career data. Showing starter suggestions for ${mbti} in the meantime.`
        : `No ranked matches are visible for ${mbti}. Check mbti_types and mbti_career_matches data and their RLS SELECT policies. Showing starter suggestions.`;
    renderTopMatches(starterMatches, starterStatus);
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

const homeMbti = document.querySelector("#home-mbti");
const signupMbtiOptions = Array.from(document.querySelector("#mbti").options)
    .filter((option) => option.value);
homeMbti.insertAdjacentHTML("beforeend", signupMbtiOptions.map((option) =>
    `<option value="${escapeHTML(option.value)}">${escapeHTML(option.textContent)}</option>`
).join(""));

document.querySelector("#update-mbti").addEventListener("click", async (event) => {
    const button = event.currentTarget;
    const mbti = homeMbti.value;
    if (!activeUser || !mbti) {
        showToast("Choose an MBTI type before updating your matches.", true);
        return;
    }

    setButtonBusy(button, true, "Updating...");
    try {
        const { data, error } = await getSupabaseClient().auth.updateUser({
            data: { ...activeUser.user_metadata, mbti }
        });
        if (error) throw error;
        showWorkspace(data.user);
        showToast("Your MBTI profile and career matches are updated.");
    } catch (error) {
        showToast(error instanceof Error ? error.message : "Unable to update your MBTI profile.", true);
    } finally {
        setButtonBusy(button, false, "Updating...");
    }
});

document.querySelectorAll("[data-page-link]").forEach((link) => {
    link.addEventListener("click", (event) => {
        event.preventDefault();
        showPage(link.dataset.pageLink);
    });
});

function formatSalary(amount, region) {
    if (amount === null || amount === undefined || !Number.isFinite(Number(amount))) return "Not listed";
    const rawCurrency = careerRegions.find((item) => item.name === region)?.currency || "USD";
    const currency = /^[A-Za-z]{3}$/.test(rawCurrency) ? rawCurrency.toUpperCase() : "USD";
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
    const dataNote = document.querySelector("#career-data-note");
    dataNote.hidden = careerDataState === "ready";
    dataNote.textContent = careerDataState === "empty"
        ? "No career rows are visible to this signed-in account. Check the careers data and its RLS SELECT policy. Showing sample careers."
        : careerDataState === "error"
            ? `Could not load careers from the database: ${careerDataError} Showing sample careers.`
            : careerDataState === "loading" ? "Connecting to the career database..." : "";
    const filteredCareers = careers
        .filter((career) => `${career.name} ${career.category} ${career.skills}`.toLowerCase().includes(query))
        .sort((first, second) => {
            if (sort === "name") return first.name.localeCompare(second.name);
            if (sort === "salary") return (second.salary[region]?.senior || 0) - (first.salary[region]?.senior || 0);
            return careers.indexOf(first) - careers.indexOf(second);
        });

    document.querySelector("#career-grid").innerHTML = filteredCareers.map((career) => {
        const salary = career.salary[region];
        const description = career.description || "Explore the education pathway and salary levels for this career.";
        return `<article class="career-card">
            <div class="career-card-top"><span class="career-category">${escapeHTML(career.category)}</span><span class="career-mark" aria-hidden="true">✦</span></div>
            <h2>${escapeHTML(career.name)}</h2><p>${escapeHTML(description)}</p>
            <div class="salary-tiers">
                <div><small>Entry</small><strong>${formatSalary(salary?.entry, region)}</strong></div>
                <div><small>Mid-level</small><strong>${formatSalary(salary?.mid, region)}</strong></div>
                <div><small>Senior / Lead</small><strong>${formatSalary(salary?.senior, region)}</strong></div>
            </div>
            ${career.skills ? `<p class="career-skills"><strong>Strengths:</strong> ${escapeHTML(career.skills)}</p>` : ""}
            <div class="career-path"><small>PATHWAY</small><p>${escapeHTML(career.path)}</p></div>
            <button type="button" class="text-action" data-compare-career="${escapeHTML(career.id)}">Add to comparison →</button>
        </article>`;
    }).join("");
    document.querySelector("#career-empty").hidden = filteredCareers.length > 0;
}

function populateComparisonSelects() {
    const options = careers.map((career) =>
        `<option value="${escapeHTML(career.id)}">${escapeHTML(career.name)}</option>`
    ).join("");
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
    const salaryLead = firstSalary?.mid != null && secondSalary?.mid != null
        ? firstSalary.mid >= secondSalary.mid ? first : second
        : null;
    const comparisonResults = document.querySelector("#comparison-results");
    comparisonResults.innerHTML = `
        <div class="comparison-card"><span class="career-category">${escapeHTML(first.category)}</span><h2>${escapeHTML(first.name)}</h2><p>${escapeHTML(first.description || "Explore the education pathway and salary levels for this career.")}</p><div class="comparison-detail"><small>Pathway</small><strong>${escapeHTML(first.path)}</strong></div><div class="comparison-detail"><small>Mid-level salary · ${escapeHTML(region)}</small><strong>${formatSalary(firstSalary?.mid, region)}</strong></div></div>
        <div class="comparison-card"><span class="career-category">${escapeHTML(second.category)}</span><h2>${escapeHTML(second.name)}</h2><p>${escapeHTML(second.description || "Explore the education pathway and salary levels for this career.")}</p><div class="comparison-detail"><small>Pathway</small><strong>${escapeHTML(second.path)}</strong></div><div class="comparison-detail"><small>Mid-level salary · ${escapeHTML(region)}</small><strong>${formatSalary(secondSalary?.mid, region)}</strong></div></div>
        <div class="recommendation"><span aria-hidden="true">✦</span><div><strong>A helpful way to choose</strong><p>${salaryLead ? `${escapeHTML(salaryLead.name)} has the higher listed mid-level salary in ${escapeHTML(region)}.` : "Salary data is not available for both careers in this region."} Think about the day-to-day work and skills you enjoy, too—salary is only one part of a good fit.</p></div></div>`;
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
document.querySelector("#top-matches").addEventListener("click", (event) => {
    const button = event.target.closest("[data-match-career]");
    if (!button) return;
    const career = careers.find((item) => item.id === button.dataset.matchCareer);
    document.querySelector("#career-search").value = career?.name || "";
    renderCareers();
    showPage("explorer");
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

const loadingStartedAt = performance.now();
const minimumLoadingDuration = 2400;

function updateLoadingPercent(now) {
    const progress = Math.max(0, Math.min((now - loadingStartedAt) / minimumLoadingDuration, 0.9));
    document.querySelector("#loading-percent").textContent = `${Math.round(progress * 100)}%`;
    if (progress < 0.9) requestAnimationFrame(updateLoadingPercent);
}

function finishLoading() {
    document.querySelector("#loading-percent").textContent = "100%";
    loadingScreen.classList.add("is-finishing");
    window.setTimeout(() => {
        loadingScreen.hidden = true;
    }, 400);
}

requestAnimationFrame(updateLoadingPercent);

if (supabaseClient) {
    supabaseClient.auth.onAuthStateChange((event, session) => {
        if (event === "INITIAL_SESSION" || event === "SIGNED_IN") initialSessionResolved = true;
        if (["INITIAL_SESSION", "SIGNED_IN", "USER_UPDATED"].includes(event) && session?.user) {
            showWorkspace(session.user);
        } else if (event === "INITIAL_SESSION" || event === "SIGNED_OUT") {
            showAuth();
        }
    });
}

if (supabaseClient) {
    supabaseClient.auth.getSession()
        .then(({ data, error }) => {
            initialSessionResolved = true;
            if (error) {
                showAuth();
                showToast(error.message, true);
            } else if (data.session?.user) {
                showWorkspace(data.session.user);
            } else {
                showAuth();
            }
        })
        .catch((error) => {
            initialSessionResolved = true;
            showAuth();
            showToast(error instanceof Error ? error.message : "Unable to check your sign-in. Please try again.", true);
        });
} else {
    showAuth();
}

window.setTimeout(() => {
    if (!initialSessionResolved) showAuth();
    finishLoading();
}, minimumLoadingDuration);
