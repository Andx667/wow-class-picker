// DOM Elements
const form = document.getElementById("class-quiz");
const resultSection = document.getElementById("results");
const resultList = document.getElementById("result-list");
const resetBtn = document.getElementById("reset-btn");
const luckyBtn = document.getElementById("lucky-btn");
const startQuizBtn = document.getElementById("start-quiz-btn");
const langToggleBtn = document.getElementById("lang-toggle");
const versionSigilEl = document.getElementById("version-sigil");
const footerLinks = document.querySelectorAll(".footer-links a");

let currentLanguage = localStorage.getItem("tbc-language") || "en";
if (!window.TBC_LOCALES || !window.TBC_LOCALES[currentLanguage]) {
  currentLanguage = "en";
}

let lastRenderState = {
  topThree: null,
  answers: null,
  isLucky: false
};

// Version Sigil is a single source of truth for releases.
// Update only this object when shipping changes:
// 1) Bump patch for small edits
// 2) Bump season for larger quiz/data changes
// 3) Update date and notes summary
const VERSION_SIGIL = Object.freeze({
  track: "TBC.S03.P01",
  codename: "TwinBlades",
  date: "2026-04-14",
  notes: "gear-uniqueness + warrior-spec-split"
});

function renderVersionSigil() {
  if (!versionSigilEl) {
    return;
  }

  const label = `${tr("footer.versionSigil")}: ${VERSION_SIGIL.track}-${VERSION_SIGIL.codename} | ${VERSION_SIGIL.date} | ${VERSION_SIGIL.notes}`;
  versionSigilEl.textContent = label;
}

function tr(path) {
  const locale = window.TBC_LOCALES?.[currentLanguage] || window.TBC_LOCALES?.en || {};
  return path.split(".").reduce((acc, part) => {
    if (acc && Object.prototype.hasOwnProperty.call(acc, part)) {
      return acc[part];
    }
    return null;
  }, locale) || path;
}

function setText(selector, key) {
  const el = document.querySelector(selector);
  if (el) {
    el.textContent = tr(key);
  }
}

function setLabel(name, value, key) {
  const input = form.querySelector(`input[name="${name}"][value="${value}"]`);
  if (input && input.parentElement) {
    input.parentElement.childNodes[input.parentElement.childNodes.length - 1].textContent = ` ${tr(key)}`;
  }
}

function applyLocalization() {
  document.documentElement.lang = currentLanguage;
  document.title = tr("site.title");
  localStorage.setItem("tbc-language", currentLanguage);

  if (langToggleBtn) {
    langToggleBtn.textContent = tr("language.switchTo");
  }

  setText(".eyebrow", "hero.eyebrow");
  setText("h1", "site.title");
  setText(".lead", "hero.lead");
  setText("#start-quiz-btn", "hero.startQuiz");
  setText("#lucky-btn", "hero.lucky");
  setText(".play-you-love", "hero.reminder");

  setText("#what-is-this", "intro.title");
  setText(".intro p", "intro.body");
  const introBullets = document.querySelectorAll(".intro ul li");
  if (introBullets[0]) {
    introBullets[0].textContent = tr("intro.bullets.0");
  }
  if (introBullets[1]) {
    introBullets[1].textContent = tr("intro.bullets.1");
  }
  if (introBullets[2]) {
    introBullets[2].textContent = tr("intro.bullets.2");
  }

  setText("#quiz-title", "quiz.title");
  setText(".quiz-hint", "quiz.hint");
  const legends = form.querySelectorAll("fieldset legend");
  if (legends[0]) legends[0].textContent = tr("quiz.q1");
  if (legends[1]) legends[1].textContent = tr("quiz.q2");
  if (legends[2]) legends[2].textContent = tr("quiz.q3");
  if (legends[3]) legends[3].textContent = tr("quiz.q4");
  if (legends[4]) legends[4].textContent = tr("quiz.q5");
  if (legends[5]) legends[5].textContent = tr("quiz.q6");
  if (legends[6]) legends[6].textContent = tr("quiz.q7");
  if (legends[7]) legends[7].textContent = tr("quiz.q8");
  if (legends[8]) legends[8].textContent = tr("quiz.q9");
  if (legends[9]) legends[9].textContent = tr("quiz.q10");
  if (legends[10]) legends[10].textContent = tr("quiz.q11");

  setLabel("goal", "raid_dps", "quiz.q1o1");
  setLabel("goal", "easy_invites", "quiz.q1o2");
  setLabel("goal", "pvp_push", "quiz.q1o3");
  setLabel("goal", "flexibility", "quiz.q1o4");
  setLabel("role", "ranged", "quiz.q2o1");
  setLabel("role", "melee", "quiz.q2o2");
  setLabel("role", "tank", "quiz.q2o3");
  setLabel("role", "healer", "quiz.q2o4");
  setLabel("role", "hybrid", "quiz.q2o5");
  setLabel("complexity", "low", "quiz.q3o1");
  setLabel("complexity", "mid", "quiz.q3o2");
  setLabel("complexity", "high", "quiz.q3o3");
  setLabel("arena", "low", "quiz.q4o1");
  setLabel("arena", "mid", "quiz.q4o2");
  setLabel("arena", "high", "quiz.q4o3");
  setLabel("slotPressure", "low", "quiz.q5o1");
  setLabel("slotPressure", "mid", "quiz.q5o2");
  setLabel("slotPressure", "high", "quiz.q5o3");
  setLabel("gear", "low", "quiz.q6o1");
  setLabel("gear", "mid", "quiz.q6o2");
  setLabel("gear", "high", "quiz.q6o3");
  setLabel("solo", "low", "quiz.q7o1");
  setLabel("solo", "mid", "quiz.q7o2");
  setLabel("solo", "high", "quiz.q7o3");
  setLabel("demand", "low", "quiz.q8o1");
  setLabel("demand", "mid", "quiz.q8o2");
  setLabel("demand", "high", "quiz.q8o3");
  setLabel("gearUniqueness", "shared", "quiz.q9o1");
  setLabel("gearUniqueness", "balanced", "quiz.q9o2");
  setLabel("gearUniqueness", "unique", "quiz.q9o3");
  setLabel("fantasy", "pet_master", "quiz.q10o1");
  setLabel("fantasy", "dark_caster", "quiz.q10o2");
  setLabel("fantasy", "holy_warrior", "quiz.q10o3");
  setLabel("fantasy", "totem_fighter", "quiz.q10o4");
  setLabel("fantasy", "shapeshifter", "quiz.q10o5");
  setLabel("fantasy", "weapon_master", "quiz.q10o6");
  setLabel("fantasy", "arcane_control", "quiz.q10o7");
  setLabel("fantasy", "shadow_support", "quiz.q10o8");
  setLabel("mindset", "meta", "quiz.q11o1");
  setLabel("mindset", "balance", "quiz.q11o2");
  setLabel("mindset", "fun", "quiz.q11o3");

  setText(".actions button[type='submit']", "quiz.submit");
  setText("#reset-btn", "quiz.reset");

  setText("#results-title", "results.title");
  setText(".results-subtext", "results.subtext");
  const reminder = document.querySelector(".results-footer p");
  if (reminder) {
    reminder.innerHTML = `<strong>${tr("results.finalReminder")}</strong> ${tr("results.finalReminderText")}`;
  }
  setText(".back-top", "results.backTop");

  setText("#faq-title", "faq.title");
  const faqSummaries = document.querySelectorAll(".faq summary");
  const faqAnswers = document.querySelectorAll(".faq details p");
  if (faqSummaries[0]) faqSummaries[0].textContent = tr("faq.q1");
  if (faqSummaries[1]) faqSummaries[1].textContent = tr("faq.q2");
  if (faqSummaries[2]) faqSummaries[2].textContent = tr("faq.q3");
  if (faqAnswers[0]) faqAnswers[0].textContent = tr("faq.a1");
  if (faqAnswers[1]) faqAnswers[1].textContent = tr("faq.a2");
  if (faqAnswers[2]) faqAnswers[2].textContent = tr("faq.a3");

  setText(".site-footer > p:first-child", "footer.summary");
  if (footerLinks[0]) footerLinks[0].textContent = tr("footer.github");
  if (footerLinks[1]) footerLinks[1].textContent = tr("footer.coffee");
  if (footerLinks[2]) footerLinks[2].textContent = tr("footer.license");

  renderVersionSigil();

  if (lastRenderState.topThree) {
    renderResults(lastRenderState.topThree, lastRenderState.answers, lastRenderState.isLucky, true);
  }
}

// Data (classProfiles, answerMap, weights, farmingBonuses) are imported from data.js

function collectAnswers() {
  const data = new FormData(form);
  const answers = {};
  const optionalQuestions = new Set(["fantasy"]);

  for (const key of Object.keys(answerMap)) {
    const value = data.get(key);
    if (!value) {
      if (optionalQuestions.has(key)) {
        continue;
      }
      return null;
    }
    answers[key] = value;
  }

  return answers;
}

function getGearUniquenessScore(profileId) {
  const uniquenessBySpec = {
    bm_hunter: 7,
    surv_hunter: 8,
    marks_hunter: 6,
    destro_warlock: 7,
    affliction_warlock: 7,
    demo_warlock: 7,
    fire_mage: 6,
    arcane_mage: 6,
    frost_mage: 6,
    enhance_shaman: 5,
    elemental_shaman: 6,
    resto_shaman: 6,
    feral_druid: 9,
    balance_druid: 7,
    resto_druid: 7,
    prot_paladin: 8,
    holy_paladin: 8,
    ret_paladin: 6,
    arms_warrior: 4,
    fury_warrior: 4,
    prot_warrior: 5,
    assass_rogue: 5,
    combat_rogue: 5,
    subtlety_rogue: 5,
    priest_shadow: 7,
    priest_holy: 7,
    priest_discipline: 7,
    holy_priest_buffer: 7
  };

  return uniquenessBySpec[profileId] ?? 5;
}

function getGearUniquenessValue(profileEntry, answer) {
  const uniqueness = getGearUniquenessScore(profileEntry.id);

  if (answer === "shared") {
    return 10 - uniqueness;
  }

  if (answer === "balanced") {
    return Math.max(0, 10 - (Math.abs(uniqueness - 5) * 2));
  }

  if (answer === "unique") {
    return uniqueness;
  }

  return 5;
}

function getSpecAdjustment(profileEntry, answers) {
  let bonus = 0;

  if (profileEntry.id === "arms_warrior") {
    if (answers.goal === "pvp_push") {
      bonus += 6;
    }
    if (answers.arena === "high") {
      bonus += 5;
    }
    if (answers.goal === "raid_dps") {
      bonus -= 4;
    }
    if (answers.role === "melee") {
      bonus += 2;
    }
    if (answers.mindset === "fun") {
      bonus += 1;
    }
  }

  if (profileEntry.id === "fury_warrior") {
    if (answers.goal === "raid_dps") {
      bonus += 6;
    }
    if (answers.mindset === "meta") {
      bonus += 2;
    }
    if (answers.arena === "high") {
      bonus -= 4;
    }
    if (answers.goal === "pvp_push") {
      bonus -= 5;
    }
    if (answers.role === "melee") {
      bonus += 2;
    }
  }

  return bonus;
}

function scoreProfile(profileEntry, answers) {
  const profile = profileEntry.profile;
  let total = 0;
  let max = 0;

  Object.keys(answers).forEach((question) => {
    const answer = answers[question];
    const weight = weights[question] || 1;
    let value = 0;

    if (question === "gearUniqueness") {
      value = getGearUniquenessValue(profileEntry, answer);
    } else {
      const profileKey = answerMap[question][answer];
      value = profile[profileKey] || 0;
    }

    total += value * weight;
    max += 10 * weight;
  });

  total += getSpecAdjustment(profileEntry, answers);

  const adjusted = Math.round((total / max) * 100);
  return Math.max(0, Math.min(100, adjusted));
}

function getWhyReasons(profile, answers) {
  const reasons = [];

  const checks = [
    ["goal", tr("results.whyGoal")],
    ["role", tr("results.whyRole")],
    ["arena", tr("results.whyArena")],
    ["demand", tr("results.whyDemand")],
    ["mindset", tr("results.whyMindset")]
  ];

  for (const [question, label] of checks) {
    const key = answerMap[question][answers[question]];
    const value = profile[key] || 0;
    if (value >= 7) {
      reasons.push(label);
    }
  }

  return reasons.slice(0, 4);
}

function clampScore(value) {
  return Math.max(0, Math.min(10, value));
}

function getFarmData(profileEntry) {
  const p = profileEntry.profile;
  const tagSet = new Set(profileEntry.tags || []);
  const bonus = {
    open: 0,
    aoe: 0,
    gather: 0,
    instance: 0
  };

  const classBonus = profileEntry.farmingBonus;
  if (classBonus) {
    bonus.open += classBonus.open || 0;
    bonus.aoe += classBonus.aoe || 0;
    bonus.gather += classBonus.gather || 0;
    bonus.instance += classBonus.instance || 0;
  }

  if (tagSet.has("solo")) {
    bonus.open += 1;
    bonus.gather += 1;
  }
  if (tagSet.has("tank")) {
    bonus.aoe += 1;
    bonus.instance += 1;
  }
  if (tagSet.has("hybrid")) {
    bonus.open += 1;
    bonus.instance += 1;
  }

  const openWorld = clampScore((p.solo_high * 0.65) + (p.gear_low * 0.2) + (p.flexibility * 0.15) + bonus.open);
  const aoeFarm = clampScore((p.flexibility * 0.3) + (p.high * 0.15) + (p.solo_mid * 0.4) + (p.tank * 0.15) + bonus.aoe);
  const gathering = clampScore((p.solo_high * 0.5) + (p.low * 0.2) + (p.flexibility * 0.3) + bonus.gather);
  const soloInstance = clampScore((p.tank * 0.3) + (p.solo_high * 0.45) + (p.gear_low * 0.25) + bonus.instance);

  const overall10 = (openWorld * 0.35) + (aoeFarm * 0.25) + (gathering * 0.2) + (soloInstance * 0.2);
  const overall = Math.round(overall10 * 10);

  let label = "Moderate";
  if (overall >= 75) {
    label = "excellent";
  } else if (overall >= 60) {
    label = "good";
  } else if (overall < 45) {
    label = "limited";
  } else {
    label = "moderate";
  }

  return {
    overall,
    labelKey: label,
    breakdown: [
      { nameKey: "results.farmOpen", value: Math.round(openWorld * 10) },
      { nameKey: "results.farmAoe", value: Math.round(aoeFarm * 10) },
      { nameKey: "results.farmGather", value: Math.round(gathering * 10) },
      { nameKey: "results.farmInstance", value: Math.round(soloInstance * 10) }
    ]
  };
}

function getGearTips(profileEntry) {
  const statPrioritiesBySpec = {
    bm_hunter: ["Hit (to cap)", "Agility", "Attack Power", "Crit"],
    surv_hunter: ["Agility", "Hit (to cap)", "Crit", "Attack Power"],
    marks_hunter: ["Hit (to cap)", "Agility", "Attack Power", "Haste"],
    destro_warlock: ["Spell Hit (to cap)", "Spell Power", "Crit", "Haste"],
    affliction_warlock: ["Spell Hit (to cap)", "Spell Power", "Haste", "Crit"],
    demo_warlock: ["Spell Hit (to cap)", "Spell Power", "Stamina", "Haste"],
    fire_mage: ["Spell Hit (to cap)", "Spell Power", "Haste", "Crit"],
    arcane_mage: ["Spell Hit (to cap)", "Spell Power", "Intellect", "Haste"],
    frost_mage: ["Spell Hit (to cap)", "Spell Power", "Crit", "Haste"],
    enhance_shaman: ["Hit (to cap)", "Expertise", "Attack Power", "Crit"],
    elemental_shaman: ["Spell Hit (to cap)", "Spell Power", "Haste", "Crit"],
    resto_shaman: ["+Healing", "Mp5", "Intellect", "Spell Crit"],
    feral_druid: ["Defense/Survival", "Armor", "Agility", "Stamina"],
    balance_druid: ["Spell Hit (to cap)", "Spell Power", "Haste", "Crit"],
    resto_druid: ["+Healing", "Spirit", "Mp5", "Intellect"],
    prot_paladin: ["Defense (uncrushable)", "Spell Power", "Stamina", "Block Value"],
    holy_paladin: ["+Healing", "Intellect", "Mp5", "Spell Crit"],
    ret_paladin: ["Hit (to cap)", "Strength", "Crit", "Attack Power"],
    arms_warrior: ["Resilience (PvP)", "Hit (PvP cap)", "Strength", "Crit"],
    fury_warrior: ["Hit (to cap)", "Expertise", "Strength", "Crit"],
    prot_warrior: ["Defense (uncrittable)", "Stamina", "Block Value", "Avoidance"],
    assass_rogue: ["Hit (to cap)", "Expertise", "Agility", "Attack Power"],
    combat_rogue: ["Hit (to cap)", "Expertise", "Attack Power", "Haste"],
    subtlety_rogue: ["Resilience (PvP)", "Agility", "Attack Power", "Crit"],
    priest_shadow: ["Spell Hit (to cap)", "Spell Power", "Haste", "Crit"],
    priest_holy: ["+Healing", "Spirit", "Mp5", "Intellect"],
    priest_discipline: ["+Healing", "Intellect", "Mp5", "Spell Crit"],
    holy_priest_buffer: ["+Healing", "Spirit", "Mp5", "Intellect"]
  };

  const stats = statPrioritiesBySpec[profileEntry.id] || ["Primary throughput stat", "Hit/Defense cap", "Sustain stat", "Utility stat"];
  return `${tr("messages.gearTipPrefix")} ${stats.join(" > ")}.`;
}

function renderResults(topThree, answers, isLucky = false, skipScroll = false) {
  lastRenderState = {
    topThree,
    answers,
    isLucky
  };

  resultList.innerHTML = "";

  topThree.forEach((entry, index) => {
    const card = document.createElement("article");
    card.className = "result-card";

    const farmData = getFarmData(entry.profile);
    const farmBreakdown = farmData.breakdown
      .map((item) => `<li><span>${tr(item.nameKey)}</span><strong>${item.value}/100</strong></li>`)
      .join("");

    const strengths = entry.profile.strengths.map((item) => `<li>${item}</li>`).join("");
    const tradeoffs = entry.profile.tradeoffs.map((item) => `<li>${item}</li>`).join("");
    const gearTip = getGearTips(entry.profile);

    let scoreAndWhy = "";
    if (!isLucky) {
      const why = getWhyReasons(entry.profile.profile, answers)
        .map((item) => `<li>${item}</li>`)
        .join("");
      scoreAndWhy = `
      <p class="result-score">${tr("results.fitScore")}: ${entry.score}%</p>
      <h4>${tr("results.whyTitle")}</h4>
      <ul>${why || `<li>${tr("results.whyFallback")}</li>`}</ul>
      `;
    }

    card.innerHTML = `
      <span class="result-rank">#${index + 1} ${isLucky ? tr("results.rankRandom") : tr("results.rankMatch")}</span>
      <h3>${entry.profile.name}</h3>
      ${scoreAndWhy}
      <p class="farm-score">${tr("results.farmScore")}: ${farmData.overall}/100 <span>(${tr(`results.farm${farmData.labelKey.charAt(0).toUpperCase()}${farmData.labelKey.slice(1)}`)})</span></p>
      <h4>${tr("results.farmBreakdown")}</h4>
      <ul class="farm-breakdown">${farmBreakdown}</ul>
      <h4>${tr("results.strengths")}</h4>
      <ul>${strengths}</ul>
      <h4>${tr("results.tradeoffs")}</h4>
      <ul>${tradeoffs}</ul>
      <h4>${tr("results.gearTitle")}</h4>
      <p><strong>${tr("results.statPriority")}:</strong> ${gearTip}</p>
      <p class="gear-note">${tr("results.gearNote")}</p>
      <p class="guide-links"><strong>${tr("results.guides")}:</strong>
        <a href="${entry.profile.guides.wowhead}" target="_blank" rel="noopener">Wowhead</a>
        &middot;
        <a href="${entry.profile.guides.icyveins}" target="_blank" rel="noopener">Icy Veins</a>
      </p>
      `;

    resultList.appendChild(card);
  });

  resultSection.hidden = false;
  if (!skipScroll) {
    resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function getRandomSpecs(count = 3) {
  const shuffled = [...classProfiles].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((profile) => ({ profile, score: null }));
}

function clearInvalidNote() {
  const existing = form.querySelector(".invalid-note");
  if (existing) {
    existing.remove();
  }
}

function showInvalidNote() {
  clearInvalidNote();
  const note = document.createElement("p");
  note.className = "invalid-note";
  note.textContent = tr("messages.invalid");
  form.appendChild(note);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  clearInvalidNote();

  const answers = collectAnswers();
  if (!answers) {
    showInvalidNote();
    return;
  }

  const scored = classProfiles
    .map((profile) => ({
      profile,
      score: scoreProfile(profile, answers)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  renderResults(scored, answers);
});

luckyBtn.addEventListener("click", () => {
  clearInvalidNote();
  const randomSpecs = getRandomSpecs(3);
  renderResults(randomSpecs, null, true);
});

startQuizBtn.addEventListener("click", () => {
  const quizSection = document.getElementById("quiz");
  if (quizSection) {
    quizSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }
});

langToggleBtn.addEventListener("click", () => {
  currentLanguage = currentLanguage === "en" ? "de" : "en";
  applyLocalization();
});

resetBtn.addEventListener("click", () => {
  form.reset();
  clearInvalidNote();
  resultSection.hidden = true;
  resultList.innerHTML = "";
});

applyLocalization();
