// DOM Elements
const form = document.getElementById("class-quiz");
const resultSection = document.getElementById("results");
const resultList = document.getElementById("result-list");
const resetBtn = document.getElementById("reset-btn");

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

function scoreProfile(profile, answers) {
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

  return Math.round((total / max) * 100);
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

function renderResults(topThree, answers) {
  resultList.innerHTML = "";

  topThree.forEach((entry, index) => {
    const card = document.createElement("article");
    card.className = "result-card";

    const why = getWhyReasons(entry.profile.profile, answers)
      .map((item) => `<li>${item}</li>`)
      .join("");

    const farmData = getFarmData(entry.profile);
    const farmBreakdown = farmData.breakdown
      .map((item) => `<li><span>${item.name}</span><strong>${item.value}/100</strong></li>`)
      .join("");

    const strengths = entry.profile.strengths.map((item) => `<li>${item}</li>`).join("");
    const tradeoffs = entry.profile.tradeoffs.map((item) => `<li>${item}</li>`).join("");

    card.innerHTML = `
      <span class="result-rank">#${index + 1} Match</span>
      <h3>${entry.profile.name}</h3>
      <p class="result-score">Fit Score: ${entry.score}%</p>
      <p class="farm-score">Farm Score: ${farmData.overall}/100 <span>(${farmData.label})</span></p>
      <h4>Why It Fits</h4>
      <ul>${why || "<li>Broad overall alignment with your answers</li>"}</ul>
      <h4>Farming Breakdown</h4>
      <ul class="farm-breakdown">${farmBreakdown}</ul>
      <h4>TBC Strengths</h4>
      <ul>${strengths}</ul>
      <h4>Tradeoffs</h4>
      <ul>${tradeoffs}</ul>
      <p><strong>Next Step:</strong> ${entry.profile.nextSteps}</p>
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
      score: scoreProfile(profile.profile, answers)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  renderResults(scored, answers);
});

resetBtn.addEventListener("click", () => {
  form.reset();
  clearInvalidNote();
  resultSection.hidden = true;
  resultList.innerHTML = "";
});
