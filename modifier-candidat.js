const API_BASE = "http://localhost:3000";

// Fonction pour remplir le champ Aktuelle Gruppe (Groupe0)
function fillGroupe0Options(unterniveauValue, gruppen, groupe0Field) {
  groupe0Field.innerHTML = '<option value="">Bitte wählen</option>';

  let prefix = null;
  if (unterniveauValue) {
    prefix = `Niveau ${unterniveauValue}`;
  }

  let added = 0;
  gruppen.forEach(g => {
    const cleanedTitle = g.Title.replace(/\s+/g, "");
    const cleanedPrefix = prefix ? prefix.replace(/\s+/g, "") : null;

    if (!prefix || cleanedTitle.startsWith(cleanedPrefix)) {
      const opt = document.createElement("option");
      opt.value = g.Title;
      opt.textContent = g.Title;
      groupe0Field.appendChild(opt);
      added++;
    }
  });

  if (added === 0) {
    const opt = document.createElement("option");
    opt.disabled = true;
    opt.textContent = "⚠️ Keine passenden Gruppen gefunden";
    groupe0Field.appendChild(opt);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("editCandidateForm");
  const candidateId = new URLSearchParams(window.location.search).get("id");

  if (!form || !candidateId) {
    alert("❌ Kandidaten-ID nicht gefunden.");
    return;
  }

  const fixedDropdowns = {
    Familienstand: ["Ledig", "Verheiratet", "Geschieden", "Verwitwet"],
    Schule: ["Sousse", "Tunis"],
    AnzahlderBerufsjahre: ["Keine", "1 bis 6 Monate","7 bis 11 Monate", "1 Jahr","2 Jahre","3 Jahre","4 Jahre","5 Jahre","Über 5 Jahre"],
    Zugeh_x00f6_rigkeit: ["Intern", "Extern"],
    Niveaux: ["A1", "A2", "B1", "B2"],
    Unterniveau: ["A 1.1", "A 1.2", "A 2.1", "A 2.2", "B 1.1", "B 1.2", "B 2.1", "B 2.2"],
    Kinder: ["Ja", "Nein"],
    Vorstellungsgespr_x00e4_ch: ["Ja", "Nein"],
    Defizitbescheid: ["Ja", "Nein"],
    Vorabzustimmung: ["Ja", "Nein"],
    Visum: ["Ja", "Nein"],
    Dokumenten_x00fc_bersetzung: ["Ja", "Nein"],
    Vertragunterschrieben: ["Ja", "Nein"],
    B2_x002d_Testbestanden: ["Ja", "Nein"],
    Vermittlungsstand: ["In Vermittlung", "Schon vermittelt"],
    Aktuelle_Phase: [
      "Start/ Kandidaten- und Kandidatinnen- suche",
      "Deutschkurse (A1 bis B1)",
      "B1 Prüfung",
      "B2 Deutschkurs",
      "Visum Antrag",
      "Einreise nach Deutschland, Arbeitsbeginn",
      "Anerkennungsverfahren und B2 Prüfung"
    ],
    AnzahlderBerufsjahre: [
      "Keine",
      "1 bis 6 Monate",
      "7 bis 11 Monate",
      "1 Jahr",
      "2 Jahre",
      "3 Jahre",
      "4 Jahre",
      "5 Jahre",
      "Über 5 Jahre"
    ],
    Unterrichtsform: ["Präsenz", "Online"],
Vorstellungsgespr_x00e4_ch: ["Ja", "Nein"],
Defizitbescheid: ["Ja", "Nein"],
Vorabzustimmung: ["Ja", "Nein"],
Visum: ["Ja", "Nein"],
Dokumenten_x00fc_bersetzung: ["Ja", "Nein"],
Vertragunterschrieben: ["Ja", "Nein"],
B2_x002d_Testbestanden: ["Ja", "Nein"],
Vermittlungsstand: ["In Vermittlung", "Schon Vermittelt"],
Aktuelle_Phase: [
  "Start/ Kandidaten- und Kandidatinnen- suche",
  "Deutschkurse (A1 bis B1)",
  "B1 Prüfung",
  "B2 Deutschkurs",
  "Visum Antrag",
  "Einreise nach Deutschland, Arbeitsbeginn",
  "Anerkennungsverfahren und B2 Prüfung"
]

  };

  try {
    const [response, gruppenResponse] = await Promise.all([
      fetch(`${API_BASE}/get/${candidateId}`),
      fetch(`${API_BASE}/groupes`)
    ]);

    const data = await response.json();
    const gruppen = await gruppenResponse.json();

    console.log("📦 Groupes reçus :", gruppen);

    for (const [key, value] of Object.entries(data)) {
      const input = form.querySelector(`[name="${key}"]`);
      if (!input) continue;

      if (input.tagName === "SELECT") {
        // Dropdowns fixes
        if (fixedDropdowns[key]) {
          fixedDropdowns[key].forEach(optVal => {
            const opt = document.createElement("option");
            opt.value = optVal;
            opt.textContent = optVal;
            input.appendChild(opt);
          });
        }

        // Dropdowns dynamiques (A/B x.x)
        const match = key.match(/Anzahl_Stunden_(A|B)(\d)_x002e_(\d)/);
        if (match) {
          const niveau = `${match[1]} ${match[2]}.${match[3]}`;
          const prefix = `Niveau ${niveau}`;
          console.log(`🔍 Injection des groupes pour ${key} avec préfixe "${prefix}"`);
          gruppen.forEach(g => {
            if (g.Title.replace(/\s+/g, "").startsWith(prefix.replace(/\s+/g, ""))) {
              const opt = document.createElement("option");
              opt.value = g.Title;
              opt.textContent = g.Title;
              input.appendChild(opt);
            }
          });
        }

        // Fallback si valeur existe mais pas dans options
        if (value && !Array.from(input.options).some(opt => opt.value === value)) {
          const fallback = document.createElement("option");
          fallback.value = value;
          fallback.textContent = `⚠️ ${value}`;
          input.appendChild(fallback);
        }

        input.value = value ?? "";
      } else if (input.type === "date" && value) {
        input.value = new Date(value).toISOString().split("T")[0];
      } else {
        input.value = value ?? "";
      }
    }

    // Remplir tous les dropdowns dynamiques même si pas dans data
    const dynamicSelects = form.querySelectorAll("select[id^='Anzahl_Stunden_']");
    dynamicSelects.forEach(select => {
      if (select.options.length > 1) return;
      const match = select.name.match(/Anzahl_Stunden_(A|B)(\d)_x002e_(\d)/);
      if (match) {
        const niveau = `${match[1]} ${match[2]}.${match[3]}`;
        const prefix = `Niveau ${niveau}`;
        console.log(`🔄 Remplissage vide pour ${select.name} avec "${prefix}"`);
        gruppen.forEach(g => {
          if (g.Title.replace(/\s+/g, "").startsWith(prefix.replace(/\s+/g, ""))) {
            const opt = document.createElement("option");
            opt.value = g.Title;
            opt.textContent = g.Title;
            select.appendChild(opt);
          }
        });
      }
    });

    // Kinder
    const kinderSelect = form.querySelector(`[name="Kinder"]`);
    const anzKinderInput = form.querySelector(`[name="AnzahlderKinder"]`);
    if (kinderSelect && anzKinderInput) {
      anzKinderInput.readOnly = kinderSelect.value !== "Ja";
      kinderSelect.addEventListener("change", () => {
        if (kinderSelect.value === "Ja") {
          anzKinderInput.readOnly = false;
          anzKinderInput.value = "";
        } else {
          anzKinderInput.readOnly = true;
          anzKinderInput.value = "0";
        }
      });
    }

    // 🔁 Groupe0 dynamique basé sur Unterniveau
    const groupe0Field = form.querySelector(`[name="Groupe0"]`);
    const unterniveauField = form.querySelector(`[name="Unterniveau"]`);
    if (groupe0Field && unterniveauField) {
      fillGroupe0Options(unterniveauField.value, gruppen, groupe0Field);

      // valeur existante ?
      if (data["Groupe0"]) {
        groupe0Field.value = data["Groupe0"];
      }

      // Dynamique en cas de changement
      unterniveauField.addEventListener("change", () => {
        const selectedUnterniveau = unterniveauField.value;
        fillGroupe0Options(selectedUnterniveau, gruppen, groupe0Field);
      });
    }

    // Submit
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const updatedData = {};
      for (const [key, val] of formData.entries()) {
        updatedData[key] = val;
      }

      const patch = await fetch(`${API_BASE}/update/${candidateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData)
      });

      if (patch.ok) {
        alert("✅ Änderungen gespeichert.");
        window.location.href = "liste-candidaten.html";
      } else {
        alert("❌ Fehler beim Speichern.");
      }
    });

  } catch (err) {
    console.error("❌ Fehler beim Laden:", err);
    alert("Fehler beim Laden der Kandidatendaten.");
  }
});
