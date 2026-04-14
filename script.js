// DOM Elements
const form = document.getElementById("class-quiz");
const resultSection = document.getElementById("results");
const resultList = document.getElementById("result-list");
const resetBtn = document.getElementById("reset-btn");
const luckyBtn = document.getElementById("lucky-btn");

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
    const profileKey = answerMap[question][answer];
    const weight = weights[question] || 1;
    const value = profile[profileKey] || 0;

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
    ["goal", "Matches your primary objective"],
    ["role", "Fits your preferred role"],
    ["arena", "Aligns with your PvP priority"],
    ["demand", "Lines up with your invite-demand expectations"],
    ["mindset", "Fits your performance vs fun mindset"]
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
    label = "Excellent";
  } else if (overall >= 60) {
    label = "Good";
  } else if (overall < 45) {
    label = "Limited";
  }

  return {
    overall,
    label,
    breakdown: [
      { name: "Open-world grind", value: Math.round(openWorld * 10) },
      { name: "AoE pull farming", value: Math.round(aoeFarm * 10) },
      { name: "Gathering routes", value: Math.round(gathering * 10) },
      { name: "Solo-instance style", value: Math.round(soloInstance * 10) }
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
  return `Prioritize ${stats.join(" > ")}.`;
}

function renderResults(topThree, answers, isLucky = false) {
  resultList.innerHTML = "";

  topThree.forEach((entry, index) => {
    const card = document.createElement("article");
    card.className = "result-card";

    const farmData = getFarmData(entry.profile);
    const farmBreakdown = farmData.breakdown
      .map((item) => `<li><span>${item.name}</span><strong>${item.value}/100</strong></li>`)
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
      <p class="result-score">Fit Score: ${entry.score}%</p>
      <h4>Why It Fits</h4>
      <ul>${why || "<li>Broad overall alignment with your answers</li>"}</ul>
      `;
    }

    card.innerHTML = `
      <span class="result-rank">#${index + 1}${isLucky ? " Random Pick" : " Match"}</span>
      <h3>${entry.profile.name}</h3>
      ${scoreAndWhy}
      <p class="farm-score">Farm Score: ${farmData.overall}/100 <span>(${farmData.label})</span></p>
      <h4>Farming Breakdown</h4>
      <ul class="farm-breakdown">${farmBreakdown}</ul>
      <h4>TBC Strengths</h4>
      <ul>${strengths}</ul>
      <h4>Tradeoffs</h4>
      <ul>${tradeoffs}</ul>
      <h4>How to Gear</h4>
      <p><strong>Stat Priority:</strong> ${gearTip}</p>
      <p class="gear-note">Use the linked guides below to confirm exact caps and phase-specific upgrades.</p>
      <p class="guide-links"><strong>Guides:</strong>
        <a href="${entry.profile.guides.wowhead}" target="_blank" rel="noopener">Wowhead</a>
        &middot;
        <a href="${entry.profile.guides.icyveins}" target="_blank" rel="noopener">Icy Veins</a>
      </p>
      `;

    resultList.appendChild(card);
  });

  resultSection.hidden = false;
  resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
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
  note.textContent = "Please answer all required questions before generating results.";
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

resetBtn.addEventListener("click", () => {
  form.reset();
  clearInvalidNote();
  resultSection.hidden = true;
  resultList.innerHTML = "";
});
