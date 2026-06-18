# 🏆 WM Tippmodell 2026

Ein minimalistisches, lokales Tool zur Verwaltung und Berechnung von WM-Tipps basierend auf eigenen Team-Ratings und dynamischen Tor-Statistiken. Crafted im Shadcn-Dark-Design mit Space Grotesk Typografie.

## 🛠️ Features

* **100% Lokal & Autark:** Alle Daten werden direkt in der lokalen `data.json` gespeichert. Kein Datenbank-Overhead, keine externen API-Abhängigkeiten.
* **Taktischer Algorithmus:** Berechnet präzise Tipp-Vorhersagen (X:Y) basierend auf deinen individuellen 0-100 Stärke-Reglern und der realen Torquote pro Spiel (TPS).
- **Intelligente K.-o.-Phase:** Erkennt unentschiedene Tipp-Tendenzen in der K.-o.-Runde und vergibt automatisch ein simuliertes Siegtor für das höher bewertete Team.
* **Kaskadierendes Löschen:** Beim Entfernen eines Teams werden alle verknüpften Spiele automatisch mitgeräumt, um verwaiste Datenreste im JSON zu verhindern.
