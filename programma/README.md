# SCSI — Archivio didattico di *Struttura, Costruzione, Sistemi e Impianti del Mezzo* (aereo)

Materiali per l'insegnamento della disciplina **Struttura, costruzione, sistemi e impianti del mezzo**
nell'indirizzo *Trasporti e Logistica* — articolazione **Costruzione del Mezzo Aereo** degli Istituti
Tecnici (settore Tecnologico).

> Autore: **Prof. Ing. Biagio Raucci** — ITIS «E. Majorana», Cassino (FR)
> Licenza: **CC BY-NC-ND 4.0** · Sito: [raucci.net](https://www.raucci.net)

---

## Finalità

Il repository raccoglie, in forma ordinata e liberamente consultabile, i materiali prodotti per il
corso di *Costruzioni Aeronautiche*: la **programmazione disciplinare** per le tre classi, un corpus
di **monografie e dispense** a impostazione *physics-first* e un archivio di **soluzioni delle prove
d'Esame di Stato**. L'obiettivo è offrire a studenti e colleghi un percorso coerente che va dai
fondamenti fisici e matematici fino al progetto strutturale, agli impianti e alle prestazioni del
velivolo, con dimostrazioni ed esempi numerici verificati.

---

## Contenuti

### 1. Programmazione didattica per competenze *(più recente)*

Tre programmi formali, uno per anno di corso, redatti secondo il modello della *didattica per
competenze* (Risultati di apprendimento del quinquennio, Competenze, Unità di Apprendimento con
Conoscenze / Abilità / Saperi minimi).

| File | Classe | Contenuto |
|------|--------|-----------|
| `Programma_SCSI_Classe_3.pdf` | 3ª | Fondamenti vettoriali, atmosfera ISA, fluidodinamica e aerodinamica di base, materiali, strumenti di bordo, laboratorio Python |
| `Programma_SCSI_Classe_4.pdf` | 4ª | Ipersostentazione, volo supersonico, eliche, elicotteri, carichi e inviluppo di volo, strutture, laboratorio XFLR5 + Python |
| `Programma_SCSI_Classe_5.pdf` | 5ª | Meccanica del volo e prestazioni, progetto strutturale, stabilità e controllo, impianti di bordo, normativa EASA e manutenzione, laboratorio IA e aerodinamica numerica |

I sorgenti LaTeX (`preamble.tex`, `front.tex`, `back.tex`, `classe3–5.tex`) sono inclusi per
consentire l'aggiornamento e l'adattamento al quadro orario del singolo istituto.

> **Nota sul laboratorio.** A partire da quest'anno il tradizionale laboratorio CAD è sostituito da un
> **laboratorio computazionale** (Python, XFLR5 e programmazione assistita da IA) orientato alle
> applicazioni numeriche dell'aerodinamica.

### 2. Monografie e dispense (`docs/pdf/`)

Trattazioni autoconsistenti, organizzate per aree tematiche:

- **Fondamenti** — teoria dei vettori; il velivolo (classificazione, architettura, componenti).
- **Fluidodinamica** — generalità sui fluidi, statica e cinematica dei fluidi.
- **Aerodinamica** — fondamenti di aerodinamica; profili alari e ala finita; resistenza e polare;
  descrizione fisica del volo; corpo di minima resistenza.
- **Meccanica del volo e prestazioni** — volo librato, volo livellato, prestazioni di salita,
  punti caratteristici e polari tecniche, autonomie, stabilità statica.
- **Propulsione** — sistemi propulsivi (motoelica, elica, turbine a gas, turbogetto/fan/elica);
  gli elicotteri (ala rotante).
- **Costruzioni e strutture** — costruzioni aeronautiche (trave, materiali, inviluppo di volo);
  materiali aeronautici; diagrammi delle sollecitazioni lungo l'ala.
- **Laboratorio** — guida pratica a XFLR5.

### 3. Soluzioni delle prove d'Esame di Stato

Svolgimenti commentati della seconda prova scritta di Costruzioni Aeronautiche, con impostazione
metodologica, dimostrazioni ed esempi numerici (sessioni dal 2015 al 2026), oltre a fascicoli
operativi (asta di controventatura, diagramma di manovra e raffica, giunzioni rivettate, polare
aerodinamica, eliche, velivolo a reazione).

---

## Struttura del repository

```
SCSI/
├── README.md
├── docs/
│   └── pdf/            # monografie, dispense, fascicoli e prove d'esame
├── programmi/          # i tre programmi per classe (PDF + sorgenti LaTeX)
└── index.html          # indice navigabile dell'archivio
```

> I percorsi possono variare: fare riferimento all'indice `index.html` per la mappa aggiornata dei
> materiali.

---

## Destinatari e uso didattico

- **Studenti** del secondo biennio e del quinto anno dell'articolazione Costruzione del Mezzo Aereo,
  per studio, ripasso e preparazione all'Esame di Stato.
- **Docenti** della classe di concorso A038 (e affini), come base per la programmazione e per la
  produzione di materiali propri.

I materiali hanno **finalità esclusivamente didattica**: in presenza di più approcci corretti viene
privilegiato quello più chiaro e coerente con l'impostazione tipica della disciplina.

---

## Licenza

Salvo ove diversamente indicato, i materiali sono rilasciati con licenza
**[Creative Commons Attribuzione – Non commerciale – Non opere derivate 4.0 Internazionale
(CC BY-NC-ND 4.0)](https://creativecommons.org/licenses/by-nc-nd/4.0/deed.it)**.

È consentita la consultazione e la condivisione con **citazione dell'autore**, senza modifiche e per
finalità non commerciali.

## Come citare

> B. Raucci, *SCSI — Archivio didattico di Struttura, Costruzione, Sistemi e Impianti del Mezzo aereo*,
> ITIS «E. Majorana», Cassino (FR).

---

*Archivio in aggiornamento. Segnalazioni ed errata sono benvenute tramite le* issue *del repository.*
