document.addEventListener("DOMContentLoaded", () => {
  let appData = {
    teams: {},
    matches: [],
  };

  // --- DOM Elements ---
  const addTeamForm = document.getElementById("addTeamForm");
  const addMatchForm = document.getElementById("addMatchForm");
  const teamsList = document.getElementById("teamsList");
  const matchesContainer = document.getElementById("matchesContainer");
  const homeTeamSelect = document.getElementById("homeTeamSelect");
  const awayTeamSelect = document.getElementById("awayTeamSelect");
  const calculateBtn = document.getElementById("calculatePredictions");
  const saveEverythingBtn = document.getElementById("saveEverything");
  const saveRatingsBtn = document.getElementById("saveRatings");
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toastMessage");

  // --- Data Management & Sync ---

  async function fetchData() {
    try {
      const response = await fetch("/api/data");
      appData = await response.json();
      updateAll();
    } catch (error) {
      showToast("Fehler beim Laden der Daten", "error");
    }
  }

  async function saveData(silent = false) {
    try {
      const response = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appData),
      });
      if (response.ok) {
        if (!silent) showToast("Daten erfolgreich gespeichert!");
      } else {
        showToast("Fehler beim Speichern", "error");
      }
    } catch (error) {
      showToast("Fehler beim Speichern", "error");
    }
  }

  function showToast(message, type = "success") {
    toastMessage.textContent = message;
    toast.classList.remove("translate-y-32", "opacity-0");
    toast.classList.add("translate-y-0", "opacity-100");

    const icon = document.getElementById("toastIcon");
    if (type === "error") {
      icon.classList.remove("bg-white");
      icon.classList.add("bg-red-500");
    } else {
      icon.classList.add("bg-white");
      icon.classList.remove("bg-red-500");
    }

    setTimeout(() => {
      toast.classList.add("translate-y-32", "opacity-0");
      toast.classList.remove("translate-y-0", "opacity-100");
    }, 3000);
  }

  // --- Helper: Country Flag Emoji ---
  function getFlagEmoji(teamName) {
    if (!teamName) return "⚽";
    const countryMap = {
      deutschland: "DE",
      germany: "DE",
      norwegen: "NO",
      norway: "NO",
      österreich: "AT",
      austria: "AT",
      irak: "IQ",
      iraq: "IQ",
      jordanien: "JO",
      jordan: "JO",
      brasilien: "BR",
      brazil: "BR",
      frankreich: "FR",
      france: "FR",
      spanien: "ES",
      spain: "ES",
      england: "GB",
      "vereinigtes königreich": "GB",
      uk: "GB",
      usa: "US",
      "vereinigte staaten": "US",
      argentinien: "AR",
      argentina: "AR",
      italien: "IT",
      italy: "IT",
      niederlande: "NL",
      netherlands: "NL",
      belgien: "BE",
      belgium: "BE",
      portugal: "PT",
      kroatien: "HR",
      croatia: "HR",
      marokko: "MA",
      morocco: "MA",
      japan: "JP",
      südkorea: "KR",
      "south korea": "KR",
      schweiz: "CH",
      switzerland: "CH",
      dänemark: "DK",
      denmark: "DK",
      polen: "PL",
      poland: "PL",
      mexiko: "MX",
      mexico: "MX",
      serbien: "RS",
      serbia: "RS",
      uruguay: "UY",
      senegal: "SN",
      kamerun: "CM",
      cameroon: "CM",
      ghana: "GH",
      tunesien: "TN",
      tunisia: "TN",
      kanada: "CA",
      canada: "CA",
      australien: "AU",
      australia: "AU",
      "saudi-arabien": "SA",
      "saudi arabia": "SA",
      ecuador: "EC",
      katar: "QA",
      qatar: "QA",
      wales: "GB",
      schottland: "GB",
      scotland: "GB",
      algeria: "DZ",
      algerien: "DZ",
      panama: "PA",
      tschechien: "CZ",
      czechia: "CZ",
      südafrika: "ZA",
      "south africa": "ZA",
      bosnia: "BA",
      bosnien: "BA",
      usbekistan: "UZ",
      uzbekistan: "UZ",
      "DR Kongo": "CD",
      "DR Congo": "CD",
      colombia: "CO",
      kolumbien: "CO",
    };

    const code = countryMap[teamName.toLowerCase().trim()];
    if (!code) return "⚽";

    return String.fromCodePoint(
      ...[...code.toUpperCase()].map((c) => 127397 + c.charCodeAt(0)),
    );
  }

  // --- Local State ---
  const collapsedMatchdays = {};

  // --- Logic & Stats ---

  function calculateStats() {
    // Reset team stats
    Object.keys(appData.teams).forEach((name) => {
      appData.teams[name].goalsScored = 0;
      appData.teams[name].matchesPlayed = 0;
      appData.teams[name].goalsPerMatch = 0;
    });

    // Calculate based on matches
    appData.matches.forEach((match) => {
      if (match.status === "FINISHED") {
        const home = appData.teams[match.home];
        const away = appData.teams[match.away];

        if (home && away) {
          home.matchesPlayed++;
          away.matchesPlayed++;
          home.goalsScored += parseInt(match.homeScore) || 0;
          away.goalsScored += parseInt(match.awayScore) || 0;
        }
      }
    });

    // Calculate average
    Object.keys(appData.teams).forEach((name) => {
      const team = appData.teams[name];
      if (team.matchesPlayed > 0) {
        team.goalsPerMatch = (team.goalsScored / team.matchesPlayed).toFixed(2);
      }
    });
  }

  function factorial(n) {
    if (n === 0 || n === 1) return 1;
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
  }

  function poisson(k, lambda) {
    return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
  }

  function runPredictionAlgorithm() {
    appData.matches.forEach((match) => {
      if (match.status !== "FINISHED") {
        const team1 = appData.teams[match.home];
        const team2 = appData.teams[match.away];

        if (team1 && team2) {
          // 1. Expected Goals (xG)
          let baseline1 = 1.25;
          let baseline2 = 1.25;

          // Blend with form (50/50)
          if (team1.matchesPlayed > 0) {
            baseline1 = 0.5 * 1.25 + 0.5 * parseFloat(team1.goalsPerMatch);
          }
          if (team2.matchesPlayed > 0) {
            baseline2 = 0.5 * 1.25 + 0.5 * parseFloat(team2.goalsPerMatch);
          }

          const diff = team1.rating - team2.rating;
          let lambda1 = baseline1 * Math.exp(0.02 * diff);
          let lambda2 = baseline2 * Math.exp(-0.02 * diff);

          // Cap strictly between 0.2 and 5.0
          lambda1 = Math.max(0.2, Math.min(5.0, lambda1));
          lambda2 = Math.max(0.2, Math.min(5.0, lambda2));

          // 2. Poisson Matrix Match (0:0 to 6:6)
          let outcomes = [];
          for (let s1 = 0; s1 <= 6; s1++) {
            for (let s2 = 0; s2 <= 6; s2++) {
              const prob1 = poisson(s1, lambda1);
              const prob2 = poisson(s2, lambda2);
              const jointProb = prob1 * prob2;
              outcomes.push({ s1, s2, prob: jointProb });
            }
          }

          // Sort by probability descending
          outcomes.sort((a, b) => b.prob - a.prob);

          let bestOutcome = outcomes[0];

          // 3. Knockout Tie-Breaking
          const knockoutKeywords = [
            "achtelfinale",
            "viertelfinale",
            "halbfinale",
            "finale",
          ];
          const isKnockout = knockoutKeywords.some((kw) =>
            match.matchday.toLowerCase().includes(kw),
          );

          if (isKnockout && bestOutcome.s1 === bestOutcome.s2) {
            // Reject draw, pick next highest with clear winner
            for (let i = 1; i < outcomes.length; i++) {
              if (outcomes[i].s1 !== outcomes[i].s2) {
                bestOutcome = outcomes[i];
                break;
              }
            }
          }

          match.predictedHome = bestOutcome.s1;
          match.predictedAway = bestOutcome.s2;
        }
      }
    });
    showToast("Prognosen berechnet!");
    renderMatches();
  }

  // --- UI Rendering ---

  function updateAll() {
    calculateStats();
    renderTeams();
    renderMatches();
    updateSelects();
  }

  function renderTeams() {
    teamsList.innerHTML = "";
    const sortedTeams = Object.keys(appData.teams).sort();

    sortedTeams.forEach((name) => {
      const team = appData.teams[name];
      const div = document.createElement("div");
      div.className =
        "group rounded-xl border border-[#1f1f23] bg-black p-4 transition-all hover:border-zinc-700 hover:shadow-lg";
      div.innerHTML = `
                <div class="flex items-center justify-between mb-3">
                    <span class="text-sm font-bold text-white">${getFlagEmoji(name)} ${name}</span>
                    <div class="flex items-center gap-3">
                        <span class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest bg-[#09090b] px-2 py-0.5 rounded">GPM: ${team.goalsPerMatch || 0}</span>
                        <button onclick="window.deleteTeam('${name}')" class="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-white transition-all transform hover:scale-110">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="flex items-center gap-4">
                    <input type="range" min="0" max="100" value="${team.rating}"
                        class="h-1 w-full cursor-pointer appearance-none rounded-lg bg-zinc-800"
                        oninput="this.nextElementSibling.textContent = this.value"
                        onchange="window.updateTeamRating('${name}', this.value)">
                    <span class="text-xs font-bold text-white w-6 text-right">${team.rating}</span>
                </div>
            `;
      teamsList.appendChild(div);
    });
  }

  window.updateTeamRating = (name, val) => {
    if (appData.teams[name]) {
      appData.teams[name].rating = parseInt(val);
    }
  };

  // Robust Team Deletion with Persistence
  window.deleteTeam = (name) => {
    if (
      confirm(
        `Team "${name}" wirklich löschen? Alle zugehörigen Spiele werden ebenfalls permanent entfernt.`,
      )
    ) {
      // 1. Remove from teams object
      delete appData.teams[name];

      // 2. Remove all matches involving this team
      appData.matches = appData.matches.filter(
        (m) => m.home !== name && m.away !== name,
      );

      // 3. UI Updates
      updateAll();

      // 4. Immediate Sync to JSON
      saveData(true);
      showToast(`Team ${name} gelöscht.`);
    }
  };

  function updateSelects() {
    const sortedTeams = Object.keys(appData.teams).sort();
    const options = sortedTeams
      .map(
        (name) =>
          `<option value="${name}">${getFlagEmoji(name)} ${name}</option>`,
      )
      .join("");

    homeTeamSelect.innerHTML =
      '<option value="" disabled selected>Team 1 wählen</option>' + options;
    awayTeamSelect.innerHTML =
      '<option value="" disabled selected>Team 2 wählen</option>' + options;
  }

  window.toggleMatchday = (day) => {
    collapsedMatchdays[day] = !collapsedMatchdays[day];
    renderMatches();
  };

  function renderMatches() {
    matchesContainer.innerHTML = "";
    const groups = {};
    appData.matches.forEach((m) => {
      if (!groups[m.matchday]) groups[m.matchday] = [];
      groups[m.matchday].push(m);
    });

    Object.keys(groups).forEach((day) => {
      const section = document.createElement("section");
      section.className =
        "rounded-2xl border border-[#1f1f23] bg-[#09090b] overflow-hidden shadow-2xl backdrop-blur-sm";

      let matchesHtml = groups[day]
        .map((match) => {
          const isFinished = match.status === "FINISHED";
          return `
                    <div class="border-b border-[#1f1f23] last:border-b-0 p-5 transition-all hover:bg-black/40">
                        <div class="flex flex-col md:flex-row md:items-center justify-between gap-8">
                            <!-- Teams & Score Display -->
                            <div class="flex items-center justify-between md:justify-center gap-6 flex-1">
                                <div class="text-right flex-1 text-base font-bold text-zinc-100 truncate tracking-tight">${getFlagEmoji(match.home)}  ${match.home}</div>
                                <div class="flex items-center gap-3">
                                    <input type="number" value="${match.homeScore !== null ? match.homeScore : ""}"
                                        placeholder="-"
                                        class="h-12 w-12 rounded-lg border border-[#1f1f23] bg-black text-center text-lg font-bold text-white focus:border-white focus:outline-none transition-all ${isFinished ? "opacity-50" : ""}"
                                        onchange="window.updateMatchScore(${match.id}, 'home', this.value)">
                                    <span class="text-zinc-700 font-bold text-xl">:</span>
                                    <input type="number" value="${match.awayScore !== null ? match.awayScore : ""}"
                                        placeholder="-"
                                        class="h-12 w-12 rounded-lg border border-[#1f1f23] bg-black text-center text-lg font-bold text-white focus:border-white focus:outline-none transition-all ${isFinished ? "opacity-50" : ""}"
                                        onchange="window.updateMatchScore(${match.id}, 'away', this.value)">
                                </div>
                                <div class="text-left flex-1 text-base font-bold text-zinc-100 truncate tracking-tight">${match.away}  ${getFlagEmoji(match.away)} </div>
                            </div>

                            <!-- Prediction & Interactive Elements -->
                            <div class="flex items-center justify-between md:justify-end gap-8 border-t border-[#1f1f23] md:border-0 pt-5 md:pt-0">
                                <div class="flex flex-col items-center min-w-[70px]">
                                    <span class="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Tipp</span>
                                    <span class="text-sm font-bold text-zinc-400 bg-black px-3 py-1 rounded-full border border-[#1f1f23]">${match.predictedHome !== null ? match.predictedHome + ":" + match.predictedAway : "-- : --"}</span>
                                </div>
                                <div class="flex items-center gap-5">
                                    <label class="flex items-center gap-3 cursor-pointer group">
                                        <div class="relative flex items-center">
                                            <input type="checkbox" ${isFinished ? "checked" : ""}
                                                onchange="window.toggleMatchStatus(${match.id}, this.checked)"
                                                class="peer h-5 w-5 appearance-none rounded-md border border-[#1f1f23] bg-black checked:bg-white checked:border-white transition-all">
                                            <svg class="absolute h-3.5 w-3.5 text-black opacity-0 peer-checked:opacity-100 transition-opacity left-[3px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <span class="text-[11px] font-black text-zinc-500 peer-checked:text-white uppercase tracking-widest">Beendet</span>
                                    </label>
                                    <button onclick="window.deleteMatch(${match.id})" class="text-zinc-600 hover:text-white transition-colors transform hover:scale-110">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
        })
        .join("");

      const isCollapsed = collapsedMatchdays[day];

      section.innerHTML = `
                <div class="border-b border-[#1f1f23] bg-black/30 px-6 py-3 flex justify-between items-center cursor-pointer select-none" onclick="window.toggleMatchday('${day}')">
                    <div class="flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-zinc-500 transition-transform duration-200 ${isCollapsed ? "-rotate-90" : "rotate-0"}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                        <span class="text-xs font-black uppercase tracking-[0.3em] text-white">${day}</span>
                    </div>
                    <span class="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">${groups[day].length} Begegnungen</span>
                </div>
                <div class="${isCollapsed ? "hidden" : ""}">${matchesHtml}</div>
            `;
      matchesContainer.appendChild(section);
    });
  }

  // --- Interaction Handlers ---

  window.updateMatchScore = (id, side, val) => {
    const match = appData.matches.find((m) => m.id === id);
    if (match) {
      match[side + "Score"] = val === "" ? null : parseInt(val);
      calculateStats();
      renderTeams();
    }
  };

  window.toggleMatchStatus = (id, finished) => {
    const match = appData.matches.find((m) => m.id === id);
    if (match) {
      match.status = finished ? "FINISHED" : "UPCOMING";
      updateAll();
    }
  };

  window.deleteMatch = (id) => {
    if (confirm("Dieses Spiel wirklich löschen?")) {
      appData.matches = appData.matches.filter((m) => m.id !== id);
      updateAll();
    }
  };

  addTeamForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("teamName").value.trim();
    const rating = parseInt(document.getElementById("teamRating").value);

    if (name && !appData.teams[name]) {
      appData.teams[name] = {
        rating: rating,
        goalsScored: 0,
        matchesPlayed: 0,
        goalsPerMatch: 0,
      };
      document.getElementById("teamName").value = "";
      updateAll();
      showToast(`Team ${name} hinzugefügt!`);
    } else {
      showToast("Team existiert bereits oder Name ungültig", "error");
    }
  });

  addMatchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const home = homeTeamSelect.value;
    const away = awayTeamSelect.value;
    const matchday = document.getElementById("matchdayInput").value.trim();

    if (home && away && home !== away && matchday) {
      const newMatch = {
        id: Date.now(),
        home,
        away,
        homeScore: null,
        awayScore: null,
        status: "UPCOMING",
        matchday,
        predictedHome: null,
        predictedAway: null,
      };
      appData.matches.push(newMatch);
      updateAll();
      showToast("Spiel hinzugefügt!");
    } else {
      showToast("Ungültige Spieldaten", "error");
    }
  });

  calculateBtn.addEventListener("click", runPredictionAlgorithm);
  saveEverythingBtn.addEventListener("click", () => saveData());
  saveRatingsBtn.addEventListener("click", () => saveData());

  // Initial Load
  fetchData();
});
