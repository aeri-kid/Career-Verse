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
let currentLanguage = "en";

const burmeseTranslations = {
    "Preparing your CareerVerse": "CareerVerse ကို ပြင်ဆင်နေသည်",
    "Mapping your future": "သင့်အနာဂတ်ကို ပုံဖော်နေသည်",
    Welcome: "ကြိုဆိုပါတယ်",
    "Welcome, %name%": "%name%၊ ကြိုဆိုပါတယ်",
    "Discover your future": "သင့်အနာဂတ်ကို ရှာဖွေပါ",
    "United States": "အမေရိကန်ပြည်ထောင်စု",
    Canada: "ကနေဒါ",
    Myanmar: "မြန်မာ",
    "CareerVerse introduction": "CareerVerse မိတ်ဆက်",
    "Discover a future": "အနာဂတ်ကို ရှာဖွေလိုက်ပါ",
    "with purpose.": "ရည်ရွယ်ချက်ရှိရှိ။",
    "Explore careers that match your strengths and turn your curiosity into a clear path forward.": "သင့်အားသာချက်များနှင့် ကိုက်ညီသော အလုပ်အကိုင်များကို ရှာဖွေပြီး သိလိုစိတ်ကို ရှေ့ဆက်မည့် လမ်းကြောင်းအဖြစ် ပြောင်းလဲလိုက်ပါ။",
    "Career journey": "အလုပ်အကိုင်ခရီးစဉ်",
    HS: "အထက်တန်း",
    Uni: "တက္ကသိုလ်",
    Work: "အလုပ်",
    Language: "ဘာသာစကား",
    "Student account": "ကျောင်းသားအကောင့်",
    "Create your account": "အကောင့်ဖွင့်ပါ",
    "A few details will help us personalize your journey.": "သင့်ခရီးစဉ်ကို ကိုယ်ပိုင်စိတ်ကြိုက်ဖြစ်စေရန် အချက်အလက်အနည်းငယ် ဖြည့်ပါ။",
    "First name": "အမည်",
    "Last name": "မျိုးရိုးအမည်",
    "Email address": "အီးမေးလ်လိပ်စာ",
    Password: "စကားဝှက်",
    Alex: "အဲလက်စ်",
    Morgan: "မော်ဂန်",
    "At least 8 characters": "အနည်းဆုံး စာလုံး ၈ လုံး",
    "Your password": "သင့်စကားဝှက်",
    "Show password": "စကားဝှက်ပြပါ",
    "Hide password": "စကားဝှက်ဖျောက်ပါ",
    "MBTI personality type": "MBTI ကိုယ်ရည်ကိုယ်သွေးအမျိုးအစား",
    "Select your type": "သင့်အမျိုးအစားကို ရွေးပါ",
    "I haven't taken it yet": "မဖြေဆိုရသေးပါ",
    "Create account": "အကောင့်ဖွင့်မည်",
    "or continue with": "သို့မဟုတ် အောက်ပါတို့ဖြင့် ဆက်လုပ်ပါ",
    "Continue with Google": "Google ဖြင့် ဆက်လုပ်ပါ",
    "Already have an account?": "အကောင့်ရှိပြီးသားလား?",
    "Log in": "ဝင်ရောက်ရန်",
    "Welcome back": "ပြန်လည်ကြိုဆိုပါတယ်",
    "Log in to CareerVerse": "CareerVerse သို့ ဝင်ရောက်ပါ",
    "Pick up where your career journey left off.": "သင့်အလုပ်အကိုင်ခရီးစဉ်ကို ဆက်လက်စတင်လိုက်ပါ။",
    "New to CareerVerse?": "CareerVerse ကို စတင်အသုံးပြုမည်လား?",
    "Create an account": "အကောင့်တစ်ခုဖွင့်ပါ",
    "Main navigation": "ပင်မလမ်းညွှန်",
    Home: "ပင်မစာမျက်နှာ",
    "Career Explorer": "အလုပ်အကိုင်ရှာဖွေရေး",
    "Day-in-the-Life": "တစ်နေ့တာအတွေ့အကြုံ",
    Comparison: "နှိုင်းယှဉ်ရန်",
    Profile: "ပရိုဖိုင်",
    "Log Out": "ထွက်ရန်",
    "Your CareerVerse": "သင့် CareerVerse",
    "Go to profile": "ပရိုဖိုင်သို့သွားရန်",
    "YOUR NEXT CHAPTER STARTS HERE": "သင့်ရဲ့နောက်အခန်းကဏ္ဍ ဒီမှာစတင်ပါပြီ",
    "Explore your strengths, find careers that fit, and take your next step with confidence.": "သင့်အားသာချက်များကို ရှာဖွေ၊ ကိုက်ညီသည့်အလုပ်များကို တွေ့ရှိပြီး ယုံကြည်မှုရှိရှိ ရှေ့တစ်လှမ်းတက်ပါ။",
    "Explore careers": "အလုပ်အကိုင်များ ရှာဖွေရန်",
    "Your career journey": "သင့်အလုပ်အကိုင်ခရီးစဉ်",
    "Your journey": "သင့်ခရီးစဉ်",
    "YOUR JOURNEY": "သင့်ခရီးစဉ်",
    "High School": "အထက်တန်းကျောင်း",
    University: "တက္ကသိုလ်",
    Workspace: "လုပ်ငန်းခွင်",
    "A PERSONALIZED START": "သင့်အတွက် သီးသန့်အစပြုမှု",
    "Your top 3 career matches": "သင့်အတွက် ကိုက်ညီဆုံး အလုပ်အကိုင် ၃ ခု",
    "YOUR PROFILE": "သင့်ပရိုဖိုင်",
    "Your profile and top career matches": "သင့်ပရိုဖိုင်နှင့် အကိုက်ညီဆုံး အလုပ်များ",
    "Your 3 most compatible careers": "သင့်နှင့် အကိုက်ညီဆုံး အလုပ်အကိုင် ၃ ခု",
    "Edit profile": "ပရိုဖိုင်ပြင်ရန်",
    "Set up your profile →": "ပရိုဖိုင်ဖြည့်ရန် →",
    "No matches yet": "ကိုက်ညီမှုများ မရှိသေးပါ",
    "MBTI not set": "MBTI မသတ်မှတ်ရသေးပါ",
    "MBTI · %mbti%": "MBTI · %mbti%",
    "Choose your MBTI type on your profile to see career suggestions.": "အလုပ်အကိုင်အကြံပြုချက်များကြည့်ရန် ပရိုဖိုင်တွင် သင့် MBTI ကို ရွေးပါ။",
    "Career suggestions based on your MBTI type.": "သင့် MBTI အပေါ် အခြေခံထားသော အလုပ်အကိုင်အကြံပြုချက်များ။",
    "Profile name": "ပရိုဖိုင်အမည်",
    "Update your profile name and MBTI type to refresh your career matches.": "အလုပ်အကိုင်ကိုက်ညီမှုများကို ပြန်လည်ရယူရန် ပရိုဖိုင်အမည်နှင့် MBTI ကို ပြင်ဆင်ပါ။",
    "Save profile": "ပရိုဖိုင်သိမ်းဆည်းရန်",
    "Saving profile...": "ပရိုဖိုင်ကို သိမ်းဆည်းနေသည်...",
    "Enter a profile name.": "ပရိုဖိုင်အမည် ထည့်ပါ။",
    "Profile updated. Your career matches are refreshed.": "ပရိုဖိုင်ကို ပြင်ဆင်ပြီး ကိုက်ညီသော အလုပ်များကို ပြန်လည်ရယူပြီးပါပြီ။",
    "Unable to update your profile. Please try again.": "ပရိုဖိုင်ကို ပြင်ဆင်၍မရပါ။ ထပ်မံကြိုးစားပါ။",
    "MBTI type": "MBTI အမျိုးအစား",
    "Choose your MBTI type": "သင့် MBTI အမျိုးအစားကို ရွေးပါ",
    "Update matches": "ကိုက်ညီမှုများ ပြင်ဆင်ရန်",
    "Loading your career matches...": "သင့်အလုပ်အကိုင်ကိုက်ညီမှုများကို ဖွင့်နေသည်...",
    "A GOOD PLACE TO BEGIN": "စတင်ရန် သင့်တော်သောနေရာ",
    "Explore your options": "သင့်ရွေးချယ်စရာများကို ရှာဖွေပါ",
    "Find roles that match your interests and strengths.": "သင့်စိတ်ဝင်စားမှုနှင့် အားသာချက်များနှင့် ကိုက်ညီသည့် အလုပ်များကို ရှာပါ။",
    "Browse careers →": "အလုပ်အကိုင်များ ကြည့်ရန် →",
    "Try a day on the job": "အလုပ်တစ်ခုကို တစ်နေ့တာ စမ်းကြည့်ပါ",
    "Make real-world choices in a career simulation.": "အလုပ်အကိုင်ပုံစံတူဂိမ်းတွင် လက်တွေ့ရွေးချယ်မှုများ ပြုလုပ်ပါ။",
    "Start a simulation →": "ပုံစံတူဂိမ်း စတင်ရန် →",
    "Compare your options": "သင့်ရွေးချယ်မှုများကို နှိုင်းယှဉ်ပါ",
    "Put two careers side-by-side to see what fits.": "ကိုက်ညီမှုကို သိနိုင်ရန် အလုပ်အကိုင်နှစ်ခုကို ယှဉ်ကြည့်ပါ။",
    "Compare careers →": "အလုပ်အကိုင်များ နှိုင်းယှဉ်ရန် →",
    "Your profile": "သင့်ပရိုဖိုင်",
    "Keep exploring →": "ဆက်လက်ရှာဖွေရန် →",
    "FIND YOUR FIT": "သင်နှင့်ကိုက်ညီတာကို ရှာပါ",
    "Explore career paths, compare salary levels, and picture your next steps.": "အလုပ်အကိုင်လမ်းကြောင်းများနှင့် လစာများကို နှိုင်းယှဉ်ပြီး နောက်တစ်ဆင့်ကို စီစဉ်ပါ။",
    "Search careers": "အလုပ်အကိုင် ရှာရန်",
    Region: "ဒေသ",
    "Salary region": "လစာဒေသ",
    "Sort by": "စီရန်",
    "Sort careers": "အလုပ်အကိုင်များ စီရန်",
    "Best match": "အကိုက်ညီဆုံး",
    "Highest senior salary": "အတွေ့အကြုံမြင့် လစာအများဆုံး",
    "Career name": "အလုပ်အကိုင်အမည်",
    "No careers match that search. Try another keyword.": "ရှာဖွေမှုနှင့် ကိုက်ညီသောအလုပ် မတွေ့ပါ။ အခြားစကားလုံးဖြင့် ရှာကြည့်ပါ။",
    "MAKE AN INFORMED CHOICE": "အချက်အလက်အပေါ် အခြေခံ၍ ရွေးချယ်ပါ",
    "Career Comparison": "အလုပ်အကိုင် နှိုင်းယှဉ်မှု",
    "Compare two paths and see how their work, learning, and salary can differ.": "အလုပ်နှစ်ခု၏ တာဝန်၊ သင်ယူမှုနှင့် လစာကွာခြားချက်များကို နှိုင်းယှဉ်ပါ။",
    "Career one": "ပထမအလုပ်အကိုင်",
    "Career two": "ဒုတိယအလုပ်အကိုင်",
    "Compare careers": "အလုပ်အကိုင်များ နှိုင်းယှဉ်ရန်",
    "Your comparison will appear here": "နှိုင်းယှဉ်ချက်ကို ဤနေရာတွင် ပြပါမည်",
    "Choose two careers above to see them side by side.": "နှိုင်းယှဉ်ကြည့်ရန် အထက်တွင် အလုပ်အကိုင်နှစ်ခုကို ရွေးပါ။",
    "Close simulation": "ပုံစံတူဂိမ်း ပိတ်ရန်",
    "DAY-IN-THE-LIFE SIMULATOR": "တစ်နေ့တာ အလုပ်အကိုင်ပုံစံတူဂိမ်း",
    "A day as a product designer": "ထုတ်ကုန်ဒီဇိုင်နာတစ်ဦး၏ တစ်နေ့တာ",
    "Add your MBTI": "သင့် MBTI ထည့်ပါ",
    "Career explorer": "အလုပ်အကိုင်ရှာဖွေသူ",
    "Your career interests will grow as you explore.": "ဆက်လက်ရှာဖွေလေ သင့်အလုပ်အကိုင်စိတ်ဝင်စားမှုများ ပိုမိုသိရှိလာလေ ဖြစ်ပါမည်။",
    "Your %mbti% profile is a starting point for exploring careers that fit you.": "သင့် %mbti% ပရိုဖိုင်သည် သင်နှင့်ကိုက်ညီသည့် အလုပ်များရှာဖွေရန် အစပြုရာဖြစ်သည်။",
    "Choose your MBTI type to see career suggestions.": "အလုပ်အကိုင်အကြံပြုချက်များကြည့်ရန် သင့် MBTI ကို ရွေးပါ။",
    "Based on your %mbti% personality type.": "သင့် %mbti% ကိုယ်ရည်ကိုယ်သွေးအမျိုးအစားအပေါ် အခြေခံထားသည်။",
    "Choose an MBTI type to see career suggestions.": "အလုပ်အကိုင်အကြံပြုချက်များကြည့်ရန် MBTI အမျိုးအစားကို ရွေးပါ။",
    "Choose an MBTI type above to see your career matches.": "ကိုက်ညီသောအလုပ်များကြည့်ရန် အထက်တွင် MBTI အမျိုးအစားကို ရွေးပါ။",
    "Add your MBTI type to discover career suggestions.": "အလုပ်အကိုင်အကြံပြုချက်များရှာရန် သင့် MBTI ကို ထည့်ပါ။",
    "Explore this career →": "ဤအလုပ်အကိုင်ကို ကြည့်ရန် →",
    "Explore this career and see how it fits your interests.": "ဤအလုပ်အကိုင်ကို လေ့လာပြီး သင့်စိတ်ဝင်စားမှုနှင့် ကိုက်ညီမှုကို ကြည့်ပါ။",
    "Not listed": "ဖော်ပြမထားပါ",
    Entry: "စတင်အဆင့်",
    "Mid-level": "အလယ်အလတ်အဆင့်",
    "Senior / Lead": "အကြီးတန်း / ဦးဆောင်",
    Strengths: "အားသာချက်များ",
    PATHWAY: "လမ်းကြောင်း",
    "Education pathway not listed yet.": "ပညာရေးလမ်းကြောင်းကို မဖော်ပြရသေးပါ။",
    "Explore the education pathway and salary levels for this career.": "ဤအလုပ်အကိုင်၏ ပညာရေးလမ်းကြောင်းနှင့် လစာအဆင့်များကို လေ့လာပါ။",
    "Add to comparison →": "နှိုင်းယှဉ်မှုထဲ ထည့်ရန် →",
    Pathway: "လမ်းကြောင်း",
    "Mid-level salary · %region%": "အလယ်အလတ်အဆင့်လစာ · %region%",
    "A helpful way to choose": "ရွေးချယ်ရာတွင် အထောက်အကူပြုမည့် အချက်",
    "%career% has the higher listed mid-level salary in %region%.": "%region% တွင် ဖော်ပြထားသော အလယ်အလတ်အဆင့်လစာသည် %career% က ပိုများသည်။",
    "Salary data is not available for both careers in this region.": "ဤဒေသရှိ အလုပ်အကိုင်နှစ်ခုလုံး၏ လစာအချက်အလက် မရရှိပါ။",
    " Think about the day-to-day work and skills you enjoy, too—salary is only one part of a good fit.": " နေ့စဉ်လုပ်ငန်းတာဝန်များနှင့် သင်နှစ်သက်သော ကျွမ်းကျင်မှုများကိုလည်း စဉ်းစားပါ—လစာသည် ကိုက်ညီမှု၏ အစိတ်အပိုင်းတစ်ခုသာ ဖြစ်သည်။",
    "A new project lands": "ပရောဂျက်အသစ် ရောက်လာပြီ",
    "Your team needs to improve a confusing sign-up flow. What do you do first?": "သင့်အဖွဲ့သည် ရှုပ်ထွေးနေသော စာရင်းသွင်းမှုလုပ်ငန်းစဉ်ကို ပိုကောင်းအောင် ပြင်ဆင်ရမည်။ ဘာကို အရင်လုပ်မလဲ?",
    "Talk to people who use it": "အသုံးပြုသူများနှင့် စကားပြောမည်",
    "You hear the real frustrations before deciding what to change.": "ပြောင်းလဲရန် မဆုံးဖြတ်မီ သူတို့၏ အခက်အခဲအစစ်များကို သိရှိနိုင်သည်။",
    "Sketch a few possible screens": "ဖြစ်နိုင်သည့် မျက်နှာပြင်ပုံစံများ ရေးဆွဲမည်",
    "Quick sketches make it easier for the team to explore ideas.": "အကြမ်းပုံများက အဖွဲ့အတွက် အကြံဉာဏ်များကို ရှာဖွေရန် ပိုလွယ်ကူစေသည်။",
    "Check the existing sign-up data": "လက်ရှိစာရင်းသွင်းမှု အချက်အလက်ကို စစ်ဆေးမည်",
    "The numbers point to where people are getting stuck.": "အချက်အလက်များက အသုံးပြုသူများ ဘယ်နေရာတွင် အခက်တွေ့နေသည်ကို ပြသသည်။",
    "Time to collaborate": "ပူးပေါင်းလုပ်ဆောင်ချိန်",
    "A teammate has a different idea for the first screen. How do you respond?": "အဖွဲ့ဝင်တစ်ဦးတွင် ပထမမျက်နှာပြင်အတွက် အခြားအကြံရှိသည်။ သင်ဘယ်လိုတုံ့ပြန်မလဲ?",
    "Ask them to explain their thinking": "သူတို့၏ အတွေးအမြင်ကို ရှင်းပြခိုင်းမည်",
    "Understanding their goal reveals a useful perspective.": "သူတို့၏ ရည်ရွယ်ချက်ကို နားလည်ခြင်းက အသုံးဝင်သော အမြင်တစ်ခုကို ဖော်ထုတ်ပေးသည်။",
    "Make two quick versions to compare": "နှိုင်းယှဉ်ရန် ပုံစံနှစ်မျိုး အမြန်ပြုလုပ်မည်",
    "A small prototype gives everyone something concrete to discuss.": "ရှေ့ပြေးပုံစံငယ်တစ်ခုက အားလုံးကို တိကျစွာ ဆွေးနွေးနိုင်စေသည်။",
    "Choose the idea that feels clearest": "အရှင်းလင်းဆုံးဟု ထင်ရသည့်အကြံကို ရွေးမည်",
    "A clear direction helps the team move forward.": "ရှင်းလင်းသော ဦးတည်ချက်က အဖွဲ့ကို ရှေ့ဆက်စေသည်။",
    "A tricky discovery": "စဉ်းစားစရာ တွေ့ရှိချက်",
    "A user test shows people are still confused by your favorite design.": "အသုံးပြုသူစမ်းသပ်မှုအရ သင်အကြိုက်ဆုံးဒီဇိုင်းကို လူများ နားမလည်သေးကြောင်း တွေ့ရသည်။",
    "Listen and revise the design": "နားထောင်ပြီး ဒီဇိုင်းကို ပြင်ဆင်မည်",
    "Good design responds to what people actually need.": "ကောင်းမွန်သောဒီဇိုင်းသည် လူများ အမှန်တကယ်လိုအပ်သည်ကို တုံ့ပြန်သည်။",
    "Ask a follow-up question": "ထပ်မံမေးခွန်းမေးမည်",
    "A little more context can reveal the source of confusion.": "နောက်ခံအချက်အလက် အနည်းငယ်ပိုရလျှင် ရှုပ်ထွေးရသည့်အကြောင်းရင်းကို သိနိုင်သည်။",
    "Share the result with your team": "ရလဒ်ကို အဖွဲ့နှင့် မျှဝေမည်",
    "Working together helps uncover the next step.": "အတူတကွလုပ်ဆောင်ခြင်းက နောက်တစ်ဆင့်ကို ဖော်ထုတ်ပေးသည်။",
    "Share your progress": "သင့်တိုးတက်မှုကို မျှဝေပါ",
    "Your team lead asks you to present your updated direction.": "အဖွဲ့ခေါင်းဆောင်က ပြင်ဆင်ထားသော ဦးတည်ချက်ကို တင်ပြရန် တောင်းဆိုသည်။",
    "Walk through the user problem and your solution": "အသုံးပြုသူပြဿနာနှင့် သင့်ဖြေရှင်းချက်ကို ရှင်းပြမည်",
    "Connecting the problem to the solution makes your work easy to follow.": "ပြဿနာနှင့် ဖြေရှင်းချက်ကို ချိတ်ဆက်ပြခြင်းက သင့်လုပ်ဆောင်မှုကို နားလည်လွယ်စေသည်။",
    "Show the prototype and invite feedback": "ရှေ့ပြေးပုံစံကို ပြပြီး အကြံပြုချက်တောင်းမည်",
    "A working example makes it easy for others to react.": "လုပ်ဆောင်နိုင်သော ဥပမာတစ်ခုက အခြားသူများအတွက် တုံ့ပြန်ရန် လွယ်ကူစေသည်။",
    "Share the key takeaways and next steps": "အဓိကရလဒ်နှင့် နောက်တစ်ဆင့်ကို မျှဝေမည်",
    "A concise update keeps everyone aligned.": "တိုတောင်းရှင်းလင်းသော အပ်ဒိတ်က အားလုံးကို တစ်သဘောတည်းဖြစ်စေသည်။",
    "Wrap up the day": "တစ်နေ့တာကို အဆုံးသတ်ပါ",
    "You have a few minutes to reflect before heading out.": "မထွက်ခွာမီ ပြန်လည်သုံးသပ်ရန် မိနစ်အနည်းငယ် ရှိသည်။",
    "Write down what you learned from users": "အသုံးပြုသူများထံမှ သင်ယူခဲ့သည်များကို မှတ်သားမည်",
    "Reflection helps you carry useful insights into tomorrow.": "ပြန်လည်သုံးသပ်ခြင်းက အသုံးဝင်သော အသိအမြင်များကို နောက်နေ့သို့ သယ်ဆောင်ပေးသည်။",
    "List the next design tasks": "နောက်ထပ်ဒီဇိုင်းလုပ်ငန်းများကို စာရင်းပြုစုမည်",
    "A clear plan makes it easier to get started again.": "ရှင်းလင်းသောအစီအစဉ်က ပြန်လည်စတင်ရန် ပိုလွယ်ကူစေသည်။",
    "Thank your teammates for their input": "အဖွဲ့ဝင်များ၏ အကြံပြုချက်အတွက် ကျေးဇူးတင်မည်",
    "Good collaboration is part of great work.": "ကောင်းမွန်သောပူးပေါင်းဆောင်ရွက်မှုသည် အလုပ်ကောင်းတစ်ခု၏ အစိတ်အပိုင်းဖြစ်သည်။",
    "Simulation complete": "ပုံစံတူဂိမ်း ပြီးဆုံးပါပြီ",
    "Your workday, your way": "သင့်အလုပ်နေ့၊ သင့်ပုံစံ",
    "You made space for people, ideas, and thoughtful teamwork. Those are great foundations for exploring product design.": "လူများ၊ အကြံဉာဏ်များနှင့် စဉ်းစားချင့်ချိန်သော ပူးပေါင်းဆောင်ရွက်မှုအတွက် နေရာပေးခဲ့သည်။ ထုတ်ကုန်ဒီဇိုင်းကို လေ့လာရန် ကောင်းမွန်သော အခြေခံများဖြစ်သည်။",
    "You brought curiosity and teamwork to the day. There are many ways to make an impact in product design.": "ယနေ့တွင် သိလိုစိတ်နှင့် ပူးပေါင်းဆောင်ရွက်မှုကို ပြသခဲ့သည်။ ထုတ်ကုန်ဒီဇိုင်းတွင် အကျိုးသက်ရောက်မှုရှိစေမည့် နည်းလမ်းများစွာ ရှိသည်။",
    "Play again": "ထပ်ကစားမည်",
    "Scene %current% of %total%": "အခန်း %current% / %total%",
    "Creating account...": "အကောင့်ဖွင့်နေသည်...",
    "Logging in...": "ဝင်ရောက်နေသည်...",
    "Connecting to Google...": "Google နှင့် ချိတ်ဆက်နေသည်...",
    Updating: "ပြင်ဆင်နေသည်...",
    "Your account and CareerVerse profile are ready.": "သင့်အကောင့်နှင့် CareerVerse ပရိုဖိုင် အဆင်သင့်ဖြစ်ပါပြီ။",
    "Account created! Check %email% for a confirmation link.": "အကောင့်ဖွင့်ပြီးပါပြီ။ အတည်ပြုလင့်ခ်အတွက် %email% ကို စစ်ဆေးပါ။",
    "Unable to create your account. Please try again.": "အကောင့်ဖွင့်၍ မရပါ။ ထပ်မံကြိုးစားပါ။",
    "You're signed in. Welcome back!": "ဝင်ရောက်ပြီးပါပြီ။ ပြန်လည်ကြိုဆိုပါတယ်။",
    "Unable to log in. Please try again.": "ဝင်ရောက်၍ မရပါ။ ထပ်မံကြိုးစားပါ။",
    "Unable to connect with Google. Please try again.": "Google နှင့် ချိတ်ဆက်၍ မရပါ။ ထပ်မံကြိုးစားပါ။",
    "Choose an MBTI type before updating your matches.": "ကိုက်ညီမှုများ မပြင်ဆင်မီ MBTI အမျိုးအစားကို ရွေးပါ။",
    "Your MBTI profile and career matches are updated.": "သင့် MBTI ပရိုဖိုင်နှင့် အလုပ်အကိုင်ကိုက်ညီမှုများကို ပြင်ဆင်ပြီးပါပြီ။",
    "Unable to update your MBTI profile.": "သင့် MBTI ပရိုဖိုင်ကို ပြင်ဆင်၍ မရပါ။",
    "Choose two different careers to compare.": "နှိုင်းယှဉ်ရန် မတူညီသော အလုပ်အကိုင်နှစ်ခုကို ရွေးပါ။",
    "You've been signed out.": "အကောင့်မှ ထွက်ပြီးပါပြီ။",
    "No career rows are visible to this signed-in account. Check the careers data and its RLS SELECT policy. Showing sample careers.": "ဤအကောင့်တွင် အလုပ်အကိုင်အချက်အလက်များကို မမြင်ရပါ။ ဒေတာနှင့် RLS SELECT မူဝါဒကို စစ်ဆေးပါ။ နမူနာအလုပ်များကို ပြသထားသည်။",
    "Connecting to the career database...": "အလုပ်အကိုင်ဒေတာဘေ့စ်နှင့် ချိတ်ဆက်နေသည်...",
    "Could not load careers from the database: %error% Showing sample careers.": "ဒေတာဘေ့စ်မှ အလုပ်အကိုင်များကို မဖွင့်နိုင်ပါ: %error% နမူနာအလုပ်များကို ပြသထားသည်။",
    "Could not load MBTI data: %error% Showing starter suggestions.": "MBTI ဒေတာကို မဖွင့်နိုင်ပါ: %error% စတင်အသုံးပြုရန် အကြံပြုချက်များကို ပြသထားသည်။",
    "Database unavailable: %error% Showing starter suggestions for %mbti%.": "ဒေတာဘေ့စ်ကို အသုံးမပြုနိုင်ပါ: %error% %mbti% အတွက် အကြံပြုချက်များကို ပြသထားသည်။",
    "Top matches ranked for your %mbti% profile.": "သင့် %mbti% ပရိုဖိုင်အတွက် အကိုက်ညီဆုံးများကို အဆင့်လိုက်ပြထားသည်။",
    "Connecting to career data. Showing starter suggestions for %mbti% in the meantime.": "အလုပ်အကိုင်ဒေတာနှင့် ချိတ်ဆက်နေသည်။ ယာယီအားဖြင့် %mbti% အတွက် အကြံပြုချက်များကို ပြထားသည်။",
    "No ranked matches are visible for %mbti%. Check mbti_types and mbti_career_matches data and their RLS SELECT policies. Showing starter suggestions.": "%mbti% အတွက် အဆင့်သတ်မှတ်ထားသော ကိုက်ညီမှုများ မမြင်ရပါ။ mbti_types၊ mbti_career_matches ဒေတာနှင့် RLS SELECT မူဝါဒများကို စစ်ဆေးပါ။ အကြံပြုချက်များကို ပြထားသည်။",
    "INTJ - Architect": "INTJ - ဗိသုကာပညာရှင်",
    "INTP - Logician": "INTP - တွေးခေါ်ပညာရှင်",
    "ENTJ - Commander": "ENTJ - ဦးဆောင်သူ",
    "ENTP - Debater": "ENTP - ဆွေးနွေးငြင်းခုံသူ",
    "INFJ - Advocate": "INFJ - အားပေးကူညီသူ",
    "INFP - Mediator": "INFP - ကြားဝင်ညှိနှိုင်းသူ",
    "ENFJ - Protagonist": "ENFJ - လမ်းပြခေါင်းဆောင်",
    "ENFP - Campaigner": "ENFP - စိတ်အားထက်သန်သူ",
    "ISTJ - Logistician": "ISTJ - စနစ်တကျ စီမံသူ",
    "ISFJ - Defender": "ISFJ - ကာကွယ်စောင့်ရှောက်သူ",
    "ESTJ - Executive": "ESTJ - စီမံခန့်ခွဲသူ",
    "ESFJ - Consul": "ESFJ - အကြံပေးကူညီသူ",
    "ISTP - Virtuoso": "ISTP - လက်တွေ့ကျွမ်းကျင်သူ",
    "ISFP - Adventurer": "ISFP - စူးစမ်းသူ",
    "ESTP - Entrepreneur": "ESTP - စွန့်ဦးတီထွင်သူ",
    "ESFP - Entertainer": "ESFP - ဖျော်ဖြေတင်ဆက်သူ"
};

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

function t(message, values = {}) {
    let translated = currentLanguage === "my" ? burmeseTranslations[message] || message : message;
    Object.entries(values).forEach(([key, value]) => {
        translated = translated.replaceAll(`%${key}%`, String(value));
    });
    return translated;
}

function translateElement(element) {
    const textNode = Array.from(element.childNodes).find((node) =>
        node.nodeType === Node.TEXT_NODE && node.textContent.trim()
    );
    if (textNode) {
        const leadingSpace = textNode.textContent.match(/^\s*/)[0];
        const trailingSpace = textNode.textContent.match(/\s*$/)[0];
        textNode.textContent = `${leadingSpace}${t(element.dataset.i18n)}${trailingSpace}`;
    } else {
        element.textContent = t(element.dataset.i18n);
    }
}

function getUserProfile(user) {
    const metadata = user?.user_metadata || {};
    const provider = user?.app_metadata?.provider
        || user?.identities?.find((identity) => identity.provider)?.provider;
    const googleName = metadata.full_name || metadata.name;
    const accountName = [metadata.first_name, metadata.last_name].filter(Boolean).join(" ").trim();
    const savedName = typeof metadata.display_name === "string" ? metadata.display_name.trim() : "";
    const displayName = savedName
        || (provider === "google" ? googleName || accountName : accountName || googleName)
        || user?.email?.split("@")[0]
        || t("Career explorer");
    const mbti = String(metadata.mbti || "").toUpperCase();
    const initials = displayName.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

    return { displayName, mbti, initials: initials || "U" };
}

function applyLanguage(language) {
    currentLanguage = language === "my" ? "my" : "en";
    document.documentElement.lang = currentLanguage;

    document.querySelectorAll("[data-i18n]").forEach(translateElement);
    document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
        element.placeholder = t(element.dataset.i18nPlaceholder);
    });
    document.querySelectorAll("[data-i18n-aria]").forEach((element) => {
        element.setAttribute("aria-label", t(element.dataset.i18nAria));
    });
    document.querySelectorAll("[data-language-selector]").forEach((selector) => {
        selector.value = currentLanguage;
    });

    updateRegionOptions();
    if (activeUser) {
        const { displayName, mbti, initials } = getUserProfile(activeUser);
        document.querySelector("#topbar-greeting").textContent = t("Welcome, %name%", { name: displayName });
        document.querySelector("#home-profile-name").textContent = displayName;
        document.querySelector("#home-profile-mbti").textContent = mbti
            ? t("MBTI · %mbti%", { mbti })
            : t("MBTI not set");
        document.querySelector("#sidebar-name").textContent = displayName;
        document.querySelector("#sidebar-mbti").textContent = mbti || t("Add your MBTI");
        document.querySelector("#user-avatar").textContent = initials;
        document.querySelector("#topbar-avatar").textContent = initials;
        document.querySelector("#home-profile-avatar").textContent = initials;
    } else {
        document.querySelector("#topbar-greeting").textContent = t("Your CareerVerse");
    }
    document.title = workspace.hidden
        ? `${t("Welcome")} | CareerVerse`
        : `CareerVerse | ${t("Discover your future")}`;
    renderCareers();
    if (activeUser) loadTopMatches(activeUser);
    if (gameDialog.open) renderGameScene();
    if (document.querySelector("#comparison-results .comparison-card")) renderComparison();
}

document.querySelectorAll("[data-language-selector]").forEach((selector) => {
    selector.addEventListener("change", () => applyLanguage(selector.value));
});

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
    button.textContent = isBusy ? t(label) : "";
    if (!isBusy) {
        button.innerHTML = button.dataset.defaultMarkup;
        if (button.dataset.i18n) translateElement(button);
        button.querySelectorAll("[data-i18n]").forEach(translateElement);
    }
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
    const regionNames = {
        "United States": t("United States"),
        Canada: t("Canada"),
        Myanmar: t("Myanmar")
    };
    regionSelect.innerHTML = regions.map((region) =>
        `<option value="${escapeHTML(region.name)}">${escapeHTML(regionNames[region.name] || region.name)} · ${escapeHTML(region.currency)}</option>`
    ).join("");
    regionSelect.value = regions.some((region) => region.name === previousRegion)
        ? previousRegion
        : regions[0].name;
}

function localizedRegionName(region) {
    const regionNames = {
        "United States": t("United States"),
        Canada: t("Canada"),
        Myanmar: t("Myanmar")
    };
    return regionNames[region] || region;
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
    document.querySelector("#profile-name").value = "";
    document.querySelector("#profile-mbti").value = "";
    renderTopMatches([], t("Choose your MBTI type to see career suggestions."));
    workspace.hidden = true;
    authShell.hidden = false;
    document.title = `${t("Welcome")} | CareerVerse`;
}

function showWorkspace(user) {
    activeUser = user;
    const { displayName, mbti, initials } = getUserProfile(user);

    document.querySelector("#sidebar-name").textContent = displayName;
    document.querySelector("#sidebar-mbti").textContent = mbti || t("Add your MBTI");
    document.querySelector("#user-avatar").textContent = initials;
    document.querySelector("#topbar-avatar").textContent = initials;
    document.querySelector("#home-profile-avatar").textContent = initials;
    document.querySelector("#topbar-greeting").textContent = t("Welcome, %name%", { name: displayName });
    document.querySelector("#home-profile-name").textContent = displayName;
    document.querySelector("#home-profile-mbti").textContent = mbti
        ? t("MBTI · %mbti%", { mbti })
        : t("MBTI not set");
    document.querySelector("#profile-name").value = displayName;
    document.querySelector("#profile-mbti").value = mbti;
    document.querySelector("#matches-summary").textContent = mbti
        ? t("Based on your %mbti% personality type.", { mbti })
        : t("Choose your MBTI type to see career suggestions.");

    authShell.hidden = true;
    workspace.hidden = false;
    document.title = `CareerVerse | ${t("Discover your future")}`;
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
    const homeMatchList = document.querySelector("#home-top-careers");
    const homeMatchSummary = document.querySelector("#home-match-summary");
    matchStatus.textContent = status;
    if (!matches.length) {
        matchContainer.innerHTML = `<p class="match-state">${escapeHTML(t("Choose an MBTI type above to see your career matches."))}</p>`;
        homeMatchSummary.textContent = t("Choose your MBTI type on your profile to see career suggestions.");
        homeMatchList.innerHTML = `<li class="home-match-empty"><span>${escapeHTML(t("No matches yet"))}</span><button type="button" class="text-action" data-profile-link>${escapeHTML(t("Set up your profile →"))}</button></li>`;
        return;
    }

    homeMatchSummary.textContent = t("Career suggestions based on your MBTI type.");
    homeMatchList.innerHTML = matches.slice(0, 3).map(({ career, rank }, index) => `
        <li>
            <span class="home-match-rank">${escapeHTML(String(rank || index + 1).padStart(2, "0"))}</span>
            <button type="button" class="home-match-career" data-match-career="${escapeHTML(career.id)}">${escapeHTML(career.name)}</button>
        </li>`).join("");
    matchContainer.innerHTML = matches.map(({ career, rank, reason }) => `
        <article class="match-card">
            <div class="match-card-top"><span class="match-rank">0${rank}</span><span class="career-category">${escapeHTML(career.category)}</span></div>
            <h3>${escapeHTML(career.name)}</h3>
            <p>${escapeHTML(reason || career.description || career.path || t("Explore this career and see how it fits your interests."))}</p>
            <button type="button" class="text-action" data-match-career="${escapeHTML(career.id)}">${escapeHTML(t("Explore this career →"))}</button>
        </article>`).join("");
}

async function loadTopMatches(user) {
    const requestId = ++matchRequestId;
    const mbti = String(user.user_metadata?.mbti || "").toUpperCase();
    if (!mbti) {
        renderTopMatches([], t("Add your MBTI type to discover career suggestions."));
        return;
    }

    const mbtiType = mbtiTypes.find((type) => String(type.code || "").toUpperCase() === mbti);
    if (mbtiDataError) {
        const starterMatches = getStarterMatches(mbti);
        renderTopMatches(starterMatches, t("Could not load MBTI data: %error% Showing starter suggestions.", { error: mbtiDataError }));
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
            renderTopMatches(starterMatches, t("Database unavailable: %error% Showing starter suggestions for %mbti%.", { error: error.message, mbti }));
            return;
        }
        if (data?.length) {
            const matches = data.map((match, index) => ({
                career: normalizeCareer(getRelation(match.careers)),
                rank: match.match_rank || index + 1,
                reason: match.match_reason || ""
            }));
            renderTopMatches(matches, t("Top matches ranked for your %mbti% profile.", { mbti }));
            return;
        }
    }

    const starterMatches = getStarterMatches(mbti);
    const starterStatus = careerDataState === "loading"
        ? t("Connecting to career data. Showing starter suggestions for %mbti% in the meantime.", { mbti })
        : t("No ranked matches are visible for %mbti%. Check mbti_types and mbti_career_matches data and their RLS SELECT policies. Showing starter suggestions.", { mbti });
    renderTopMatches(starterMatches, starterStatus);
}

document.querySelectorAll("[data-password-toggle]").forEach((toggle) => {
    toggle.addEventListener("click", () => {
        const passwordInput = document.getElementById(toggle.dataset.passwordToggle);
        const willShow = passwordInput.type === "password";
        passwordInput.type = willShow ? "text" : "password";
        toggle.setAttribute("aria-pressed", String(willShow));
        toggle.setAttribute("aria-label", t(willShow ? "Hide password" : "Show password"));
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
            showToast(t("Your account and CareerVerse profile are ready."));
        } else {
            showToast(t("Account created! Check %email% for a confirmation link.", { email: String(formData.get("email")).trim() }));
        }
        signupForm.reset();
    } catch (error) {
        showToast(error instanceof Error ? error.message : t("Unable to create your account. Please try again."), true);
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
        showToast(t("You're signed in. Welcome back!"));
    } catch (error) {
        showToast(error instanceof Error ? error.message : t("Unable to log in. Please try again."), true);
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
            showToast(error instanceof Error ? error.message : t("Unable to connect with Google. Please try again."), true);
            setButtonBusy(button, false, "Connecting to Google...");
        }
    });
});

const profileForm = document.querySelector("#profile-form");
const profileMbti = document.querySelector("#profile-mbti");
const signupMbtiOptions = Array.from(document.querySelector("#mbti").options)
    .filter((option) => option.value);
profileMbti.insertAdjacentHTML("beforeend", signupMbtiOptions.map((option) =>
    `<option value="${escapeHTML(option.value)}" data-i18n="${escapeHTML(option.textContent)}">${escapeHTML(option.textContent)}</option>`
).join(""));

profileForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!activeUser || !profileForm.reportValidity()) return;

    const displayName = document.querySelector("#profile-name").value.trim();
    const mbti = profileMbti.value;
    if (!displayName) {
        showToast(t("Enter a profile name."), true);
        return;
    }

    const submitButton = profileForm.querySelector("[type='submit']");
    setButtonBusy(submitButton, true, "Saving profile...");
    try {
        const { data, error } = await getSupabaseClient().auth.updateUser({
            data: { ...(activeUser.user_metadata || {}), display_name: displayName, mbti }
        });
        if (error) throw error;
        showWorkspace(data.user);
        showPage("profile");
        showToast(t("Profile updated. Your career matches are refreshed."));
    } catch (error) {
        showToast(error instanceof Error ? error.message : t("Unable to update your profile. Please try again."), true);
    } finally {
        setButtonBusy(submitButton, false, "Saving profile...");
    }
});

document.querySelectorAll("[data-page-link]").forEach((link) => {
    link.addEventListener("click", (event) => {
        event.preventDefault();
        showPage(link.dataset.pageLink);
    });
});

function formatSalary(amount, region) {
    if (amount === null || amount === undefined || !Number.isFinite(Number(amount))) return t("Not listed");
    const rawCurrency = careerRegions.find((item) => item.name === region)?.currency || "USD";
    const currency = /^[A-Za-z]{3}$/.test(rawCurrency) ? rawCurrency.toUpperCase() : "USD";
    return new Intl.NumberFormat(currentLanguage === "my" ? "my-MM" : "en", {
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
        ? t("No career rows are visible to this signed-in account. Check the careers data and its RLS SELECT policy. Showing sample careers.")
        : careerDataState === "error"
            ? t("Could not load careers from the database: %error% Showing sample careers.", { error: careerDataError })
            : careerDataState === "loading" ? t("Connecting to the career database...") : "";
    const filteredCareers = careers
        .filter((career) => `${career.name} ${career.category} ${career.skills}`.toLowerCase().includes(query))
        .sort((first, second) => {
            if (sort === "name") return first.name.localeCompare(second.name);
            if (sort === "salary") return (second.salary[region]?.senior || 0) - (first.salary[region]?.senior || 0);
            return careers.indexOf(first) - careers.indexOf(second);
        });

    document.querySelector("#career-grid").innerHTML = filteredCareers.map((career) => {
        const salary = career.salary[region];
        const description = career.description || t("Explore the education pathway and salary levels for this career.");
        return `<article class="career-card">
            <div class="career-card-top"><span class="career-category">${escapeHTML(career.category)}</span><span class="career-mark" aria-hidden="true">✦</span></div>
            <h2>${escapeHTML(career.name)}</h2><p>${escapeHTML(description)}</p>
            <div class="salary-tiers">
                <div><small>${escapeHTML(t("Entry"))}</small><strong>${formatSalary(salary?.entry, region)}</strong></div>
                <div><small>${escapeHTML(t("Mid-level"))}</small><strong>${formatSalary(salary?.mid, region)}</strong></div>
                <div><small>${escapeHTML(t("Senior / Lead"))}</small><strong>${formatSalary(salary?.senior, region)}</strong></div>
            </div>
            ${career.skills ? `<p class="career-skills"><strong>${escapeHTML(t("Strengths"))}:</strong> ${escapeHTML(career.skills)}</p>` : ""}
            <div class="career-path"><small>${escapeHTML(t("PATHWAY"))}</small><p>${escapeHTML(career.path)}</p></div>
            <button type="button" class="text-action" data-compare-career="${escapeHTML(career.id)}">${escapeHTML(t("Add to comparison →"))}</button>
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
        showToast(t("Choose two different careers to compare."), true);
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
        <div class="comparison-card"><span class="career-category">${escapeHTML(first.category)}</span><h2>${escapeHTML(first.name)}</h2><p>${escapeHTML(first.description || t("Explore the education pathway and salary levels for this career."))}</p><div class="comparison-detail"><small>${escapeHTML(t("Pathway"))}</small><strong>${escapeHTML(first.path)}</strong></div><div class="comparison-detail"><small>${escapeHTML(t("Mid-level salary · %region%", { region: localizedRegionName(region) }))}</small><strong>${formatSalary(firstSalary?.mid, region)}</strong></div></div>
        <div class="comparison-card"><span class="career-category">${escapeHTML(second.category)}</span><h2>${escapeHTML(second.name)}</h2><p>${escapeHTML(second.description || t("Explore the education pathway and salary levels for this career."))}</p><div class="comparison-detail"><small>${escapeHTML(t("Pathway"))}</small><strong>${escapeHTML(second.path)}</strong></div><div class="comparison-detail"><small>${escapeHTML(t("Mid-level salary · %region%", { region: localizedRegionName(region) }))}</small><strong>${formatSalary(secondSalary?.mid, region)}</strong></div></div>
        <div class="recommendation"><span aria-hidden="true">✦</span><div><strong>${escapeHTML(t("A helpful way to choose"))}</strong><p>${salaryLead ? escapeHTML(t("%career% has the higher listed mid-level salary in %region%.", { career: salaryLead.name, region: localizedRegionName(region) })) : escapeHTML(t("Salary data is not available for both careers in this region."))}${escapeHTML(t(" Think about the day-to-day work and skills you enjoy, too—salary is only one part of a good fit."))}</p></div></div>`;
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
function openMatchedCareer(button) {
    if (!button) return;
    const career = careers.find((item) => item.id === button.dataset.matchCareer);
    document.querySelector("#career-search").value = career?.name || "";
    renderCareers();
    showPage("explorer");
}

document.querySelector("#top-matches").addEventListener("click", (event) => {
    openMatchedCareer(event.target.closest("[data-match-career]"));
});
document.querySelector("#home-top-careers").addEventListener("click", (event) => {
    if (event.target.closest("[data-profile-link]")) {
        showPage("profile");
        return;
    }
    openMatchedCareer(event.target.closest("[data-match-career]"));
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
        progressLabel.textContent = t("Simulation complete");
        progressBar.style.width = "100%";
        sceneTitle.textContent = t("Your workday, your way");
        sceneDescription.textContent = gameScore >= 8
            ? t("You made space for people, ideas, and thoughtful teamwork. Those are great foundations for exploring product design.")
            : t("You brought curiosity and teamwork to the day. There are many ways to make an impact in product design.");
        choicesContainer.innerHTML = `<button class="primary-action" type="button" data-restart-game">${escapeHTML(t("Play again"))} <span aria-hidden="true">↻</span></button>`;
        return;
    }

    progressLabel.textContent = t("Scene %current% of %total%", {
        current: activeSceneIndex + 1,
        total: gameScenes.length
    });
    progressBar.style.width = `${(activeSceneIndex / gameScenes.length) * 100}%`;
    sceneTitle.textContent = t(scene.title);
    sceneDescription.textContent = t(scene.description);
    choicesContainer.innerHTML = scene.choices.map(([label], index) =>
        `<button class="game-choice" type="button" data-game-choice="${index}">${escapeHTML(t(label))}<span aria-hidden="true">→</span></button>`
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
        showToast(t("You've been signed out."));
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
