# WM 2026 Tippmodell / Prognose-Modell

> Ein hochpräzises, lokales Tool zur Vorhersage von Spielergebnissen basierend auf Poisson-Verteilungen. Minimalistisches Design im Dark Mode.

---

### 📖 [Ausführliche Installations- & Einrichtungsanleitung (Setup)](setup.md)
*Für eine detaillierte Schritt-für-Schritt-Anleitung und Fehlerbehebung.*

---

## Features

- **100% lokal & autonom:** Datenpersistenz ohne Latenz über eine lokale `data.json`. Keine externen Datenbanken, keine API-Abhängigkeiten.
- **Erweitertes Poisson-Modell:** Vorhersagen basieren auf Expected Goals (xG), berechnet durch die Kombination der historischen Form (Tore pro Spiel) mit einer benutzerdefinierten Teambewertung von 0–100. Das wahrscheinlichste Ergebnis wird mathematisch über eine 7x7-Wahrscheinlichkeitsmatrix ermittelt.
- **Intelligente K.-o.-Runden-Entscheidung:** Das System erkennt K.-o.-Runden automatisch, schließt Unentschieden aus und wählt das nächste wahrscheinlichste Ergebnis, das einen eindeutigen Sieger bestimmt (unter Berücksichtigung der Teambewertungen).
- **Kaskadierende Löschungen:** Strikte Datenintegrität. Wenn ein Team entfernt wird, bereinigt die Engine automatisch und sicher alle zugehörigen Spiele aus dem Datenbestand.
- **Minimalistisches Interface:** Radikales monochromes Design (Space Grotesk, Pitch Black). Mit dynamischer Flaggendarstellung (Emoji-Konvertierung über ISO-Codes) und interaktiven, einklappbaren Spieltagen mit animierten SVG-Pfeilen.

![World Cup 2026 Prediction Model App Screenshot](media/p1.png)

## Schnellstart

Voraussetzung: Python 3.10+

```bash
# 1. Virtuelle Umgebung erstellen und aktivieren
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 2. Abhängigkeiten installieren
pip install -r requirements.txt

# 3. Anwendung starten
python3 app.py
```

Öffne anschließend **[http://127.0.0.1:5000](http://127.0.0.1:5000)** in deinem Browser.
