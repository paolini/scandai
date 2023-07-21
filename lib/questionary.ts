export const languageCodes = ['it','fu','sl','de']

const questionary: IQuestionary = {
  version: "0.2.0",

  phrases: {
    school: {
      it: 'Scuola',
      fu: 'Scuele',
      en: 'School',
    },
    class: {
      it: 'Classe',
      fu: 'Classe',
      en: 'Class',
    },
    title: {
      'it': 'Fotografia linguistica',
      'fu': 'Fotografie linguistiche',
      'en': 'Linguistic photography',
    },
    compileButton: {
      'it': 'Compila il questionario',
      'fu': 'Compile il cuestionari',
      
    },
    shareButton: {
      'it': "Copia l'indirizzo del questionario",
      'fu': 'Copie il leam al cuestionari',
    },
    thanksTitle: {
      'it': 'Grazie!',
    },
    thanks: {
      'it': 'Grazie per aver compilato il questionario!',
      'fu': 'Graciis par vê compilât il cuestionari',
    },
    closeThisPage: {
      'it': 'Puoi chiudere questa pagina', 
    },
    isClosed: {
      'it': 'Il questionario è chiuso',
      'fu': 'Il cuestionari al è sierât',
    },
    chooseLanguage: {
      'it': "usa l'italiano per compilare il questionario",
      'fu': 'compile il cuestionari par furlan',
      'en': 'fill the questionnaire in English',
    },
    prevButton: {
      'it': 'Indietro',
      'en': 'Previous',
    },
    nextButton: {
      'it': 'Avanti',
      'en': 'Next',
    },
    endButton: {
      'it': 'Fine',
      'en': 'End',
    },
    sendButton: {
      'it': 'Invia',
      'en': 'Send',
    }
  },

  translations: {
    it: 'italiano',
    fu: 'furlan',
    en: 'english',
  },

  languages: {
    it: {
      it: 'Italiano',
      fu: 'Talian',
    },
    fu: {
      it: 'Friulano',
      fu: 'Furlan',
    },
    de: {
      it: 'Tedesco',
      fu: 'Todesc',
    },
    sl: {
      it: 'Sloveno',
      fu: 'Sloven',
    },
  },

  languagesExtended: {
    it: {
      it: 'Italiano',
      fu: 'Talian',
    },
    fu: {
      it: 'Friulano (o varianti)',
      fu: 'Furlan (o variantis)',
    },
    de: {
      it: 'Tedesco',
      fu: 'Todesc',
    },
    sl: {
      it: 'Sloveno',
      fu: 'Sloven',
    },
  },

  ages: [
    { 
      code: '',
      it: 'Mai (non so la lingua)',
      fu: 'Mai (no cognòs la lenghe)',
    },
    { 
      code: '0-3',
      it: '0-3 anni',
      fu: '0-3 agns',
    },
    {
      code: '3-6',
      it: '3-6 anni',
      fu: '3-6 agns',
    },
    {
      code: '6-9',
      it: '6-9 anni',
      fu: '6-9 agns',
    },
    {
      code: '9-12',
      it: '9-12 anni',
      fu: '9-12 agns',
    },
    {
      code: '12-15',
      it: '12-15 anni',
      fu: '12-15 agns',
    },
  ],

  competences: [
    {
      code: "CO",
      it: "Comprensione orale",
      fu: 'Comprension orâl',
    },	
    {
      code: "CS",
      it: "Comprensione scritta",
      fu: 'Comprension scrite',
    },
    {
      code: "PO",
      it: "Produzione orale",
      fu: 'Produzion orâl',
    },
    {
      code: "PS",
      it: "Produzione scritta",
      fu: 'Produzion scrite',
    }
  ],
  competenceValues: {
    _: {
      level: '0',
      it: "Scegli...",
      fu: 'Sielç',
    },
    _0: { 
      level: '0',
      it: "Nessuna competenza",
      fu: "Nissune competence",
    },
    _1: {
      level: '0',
      it: "Nessuna competenza",
      fu: "Nissune competence",
    },
    _2: {
      level: '0',
      it: "Nessuna competenza",
      fu: "Nissune competence",
    },
    _3: {
      level: 'A',
      it: "Principiante",
      fu: "Principiant",
    },
    _4: {
      level: 'A',
      it: "Principiante",
      fu: "Principiant",
    },
    _5: {
      level: 'A',
      it: "Principiante",
      fu: "Principiant",
    },
    _6: {
      level: 'B',
      it: "Intermedio",
      fu: "Intermedi",
    },
    _7: {
      level: 'B',
      it: "Intermedio",
      fu: "Intermedi",
    },
    _8: {
      level: 'C',
      it: "Competenza avanzata",
      fu: "Competence avanzade",
    },
    _9: {
      level: 'C',
      it: "Competenza avanzata",
      fu: "Competence avanzade",
    },
    _10: {
      level: 'C',
      it: "Competenza avanzata",
      fu: "Competence avanzade",
    },
  },

  questions:{
    "family": {
      type: "choose-language",
      question: {
        it: "Quali lingue vengono abitualmente utilizzate nella tua famiglia? (puoi indicare più di una risposta)", 
      },
    },
    "friends": {
      type: "choose-language",
      question: {
        it: "Quali lingue vengono abitualmente utilizzate nel tuo gruppo di amici? (puoi indicare più di una risposta)",
      },
    },
    "competences": {
      type: "choose-competence",
      question: {
        it: `Dai una autovalutazione delle tue competenze linguistiche 
          compilando la tabella seguente. I livelli di
          competenza utilizzati sono: livello A (principiante), livello B (intermedio), livello C (avanzato)`,
      },
    },
    "1.1.a.1": {
      type: "choose-language",
      question: {
        it: "nella mia famiglia si parla ...",
        fu: "inte mê famee si fevele ...",
      }
    },
    "1.1.b.1": {
      type: "choose-language",
      question: {
        it: "a mia mamma parlo in...",
        fu: "cun mê mari o feveli par ...",
      }
    },
    "1.1.b.2": {
      type: "choose-language",
      question: {
        it: "a mio papà parlo in...",
        fu: "cun mê mari o feveli par ...",
      }
    },
    "1.1.b.3": {
      type: "choose-language",
      question: {
        it: "ai miei fratelli/sorelle parlo in...",
        fu: "cui miei fradis / cu lis mês sûrs o feveli par ...",
      }
    },
    "1.1.b.4": {
      type: "choose-language",
      question: {
        it: "ai miei nonni parlo in...",
        fu: "cui miei nonos o feveli par ...",
      }
    },
    "1.1.c.1": {
        type: "choose-language",
        question: {
          it: "i miei genitori tra di loro parlano...",
          fu: "i miei gjenitôrs fra di lôr a feveli par ...",
        }
      },
    "1.1.c.2": {
        type: "choose-language",
        question: {
          it: "mia madre a me parla in...",
          fu: "mê mari mi fevele par ...",
        }
      },
    "1.1.c.3": {
        type: "choose-language",
        question: {
          it: "mio padre a me parla in...",
          fu: "gno pari mi fevele par ...",
        }
      },
      "1.1.c.4": {
        type: "choose-language",
        question: {
          it: "i miei fratelli/sorelle a me parlano in...",
          fu: "i miei fradis / lis mês sûrs mi fevelin par ...",
        }
      },
      "1.1.c.5": {
        type: "choose-language",
        question: {
          it: "i miei nonni a me parlano in...",
          fu: "i miei nonos mi fevelin par ...",
        }
      },
    "1.2.a.1": {
      type: "choose-language",
      question: {
        it: "ai miei amici parlo in...",
        fu: "ai miei amîs i feveli par ...",
      }
    },
    "1.2.a.2": {
      type: "choose-language",
      question: {
        it: "alle persone dei negozi parlo in...",
        fu: "aes personis dai negozis i feveli par ...",
      }
    },
    "1.2.a.3": {
      type: "choose-language",
      question: {
        it: "agli adulti del mio paese/città/quartiere parlo in...",
        fu: "ai adults dal gno paîs/citât/borc i feveli par ...",
      }
    },
    "1.2.a.4": {
      type: "choose-language",
      question: {
        it: "1.2.b. Fuori casa abitualmente...",
        fu: "1.2.b.  Fûr di cjase pal solit ...",
      }
    },
    "1.2.a.5": {
      type: "choose-language",
      question: {
        it: "i miei amici a me parlano in...",
        fu: "i miei amîs mi fevelin par ...",
      }
    },
    "1.2.a.6": {
      type: "choose-language",
      question: {
        it: "le persone dei negozi a me parlano in...",
        fu: "lis personis dai negozis mi fevelin par ...",
      }
    },
    "1.2.a.7": {
      type: "choose-language",
      question: {
        it: "gli adulti del mio paese/città/quartiere a me parlano in...",
        fu: "i adults dal gno paîs/citât/borc mi fevelin par ...",
      }
    },
    "1.2.a.8": {
      type: "choose-language",
      question: {
        it: "1.3.a. A scuola abitualmente io parlo...",
        fu: "1.3.a. A scuele pal solit jo o feveli ...",
      }
    },
    "1.2.a.9": {
      type: "choose-language",
      question: {
        it: "ai miei compagni di classe parlo in...",
        fu: "ai miei compagns di classe i feveli par ...",
      }
    },
    "1.2.a.10": {
      type: "choose-language",
      question: {
        it: "ai professori parlo in... (esclusi quelli di lingue)",
        fu: "ai professôrs i feveli par ... (gjavant chei di lenghis)",
      }
    },
    "1.3.b.1": {
      type: "choose-language",
      question: {
        it: "i miei compagni di classe a me parlano in...",
        fu: "i miei compagns di classe mi fevelin par ...",
      }
    },
    "1.3.b.2": {
      type: "choose-language",
      question: {
        it: "i professori a me parlano in... (esclusi quelli di lingue straniere)",
        fu: "i professôrs mi fevelin par ... (gjavant chei di lenghis)",
      }
    },
    "1.4.1": {
      type: "choose-language",
      question: {
        it: "quali lingue usi quando telefoni agli amici?",
        fu: "ce lenghis dopristu cuant che tu fevelis cui amîs?",
      }
    },
    "1.4.2": {
      type: "choose-language",
      question: {
        it: "quali lingue usi nelle mail, sui social e nelle chat?",
        fu: "ce lenghis dopristu intes mails, sui social e intes chats?",
      }
    },
    "1.4.3": {
      type: "choose-language",
      question: {
        it: "quali lingue vengono usate nei programmi TV che guardi?",
        fu: "ce lenghis si doprìno intai programs TV che tu cjalis?",
      }
    },
    "1.4.4": {
      type: "choose-language",
      question: {
        it: "quali lingue vengono usate nei siti internet che visiti?",
        fu: "ce lenghis si doprìno tai sîts internet che tu visitis?",
      }
    },
    "1.4.5": {
      type: "choose-language",
      question: {
        it: "in quali lingue sono scritti i libri, le storie e i fumetti che leggi?",
        fu: "cuale ise la lenghe dai libris, des storiis e dai fumets che tu leis?",
      }
    },
    "2.1.1": {
        type: 'map-language-to-age',
        question: {
          it: "A che età hai cominciato a parlare le lingue che conosci? (indica una sola fascia d'età per ciascuna voce)",
          fu: "A ce etât âstu scomençât a fevelâ lis lenghis che tu cognossis (segne une sole fasse di etât par ogni vôs)",
        }
    },
    "2.2.1": {
      type: 'map-language-to-competence',
      question: {
        it: "Esprimi una autovalutazione da 0 a 10 delle tue competenze linguistiche compilando la tabella seguente. (0=Nessuna competenza; 10=competenza avanzata. Se non conosci la lingua indica competenza 0)",
        fu: "Prove a dâ une autovalutazion di 0 a 10 des tôs competencis linguistichis inte tabelle chi sot. (0=Nissune competence; 10=Competence complete. Se no tu cognossis la lenghe segne competence 0)",
      }
    }
  },

  forms: {
    full: {
      intro: {
        it: `Cara studentessa / Caro studente, 
        chiediamo la tua gentile collaborazione per rispondere alle seguenti domande 
        relative alla tuaconoscenza delle lingue. 
        Il questionario ci aiuterà a raccogliere informazioni 
        per valutare iniziative daproporre agli studenti della tua classe e dell'istituto. 
        Il questionario è anonimo: esprimiti con libertà e sincerità. 
        Grazie per la collaborazione!
        `,
      },  
      elements: [
        { 
          element: "section",
          title: {
            it: "Lingue parlate e contesti comunicativi",
            fu: "Lenghis feveladis e contescj comunicatîfs",
          },
        },
        {
          element: "title",
          title: {
            it: "Abitualmente...",
            fu: "Pal solit ...",
          },
        },
        {
          element: "questions",
          questions: [ "1.1.a.1" ],
        },
        {
          element: "newpage",
        },
        {
          element: "title",
          title: {
            it: "In famiglia abitualmente io parlo...",
            fu: "In famee pal solit jo o feveli ...",
          },
        },
        { 
          element: "questions",
          questions: [ "1.1.b.1", "1.1.b.2", "1.1.b.3", "1.1.b.4" ],
        },
        { element: "newpage"},
        {
          element: "title",
          title: {
            it: "In famiglia abitualmente...",
            fu: "In famee pal solit ...",
          },
        },
        {
          element: "questions",
          questions: ["1.1.c.1", "1.1.c.2", "1.1.c.3", "1.1.c.4", "1.1.c.5" ],
        },
        { element: "newpage"},
        {
          element: "title",
          title: {
            it: "Fuori casa abitualmente io parlo...",
            fu: "Fûr di cjase pal solit o feveli ...",
          },
        },
        {
          element: "questions",
          questions: [
                "1.2.a.1", "1.2.a.2", "1.2.a.3", "1.2.a.4", "1.2.a.5", "1.2.a.6", 
                "1.2.a.7", "1.2.a.8", "1.2.a.9", "1.2.a.10",
              ],
        },
        { element: "newpage"},
        {
          element: "title",
          title: {
            it: "A scuola abitualmente...",
            fu: "A scuel pal solit ...",
          },
        },
        { 
          element: "questions",
          questions: [ "1.3.b.1", "1.3.b.2" ],
        },
        { element: "newpage"},
        {
          element: "title",
          title: {
            it: "Abitualmente...",
            fu: "Pal solit ...",
          },
        },
        {
          element: "questions",
          questions: [ "1.4.1", "1.4.2", "1.4.3", "1.4.4", "1.4.5" ],
        },
        { element: "newpage"},
        {
          element: "section",
          title: {
            it: "Competenza linguistica orale e scritta",
            fu: "Competence linguistiche orâl e scrite",
          },
        },
        {
          element: "questions",
          questions: [ "2.1.1" ],
        },
        { element: "newpage"},
        {
          element: "questions",  
          questions: [ "2.2.1" ],
        },
      ]  
    },
    short: {
      intro: {
        it: `Cara studentessa / Caro studente, 
        chiediamo la tua gentile collaborazione per rispondere alle seguenti domande 
        relative alla tuaconoscenza delle lingue. 
        Il questionario ci aiuterà a raccogliere informazioni 
        per valutare iniziative daproporre agli studenti della tua classe e dell'istituto. 
        Il questionario è anonimo: esprimiti con libertà e sincerità. 
        Grazie per la collaborazione!
        `,
      },
      elements : [
        { 
          element: "section",
          title: {
            it: "Istantanea linguistica"
          },
        },
        {
          element: "title",
          title: {
            it: "Lingue parlate e contesti comunicativi",
          },
        },
        { 
          element: "questions",
          questions: [ "family", "friends" ],
        },
        {
          element: "title",
          title: {
            it: "Competenza linguistica orale e scritta",
          },
        },
        { 
          element: "questions",
          questions: [ "competences" ],
        },
      ],
    }
  }
}

export default questionary

export function extractQuestionCodes(form: string) {
  let codes: string[] = []
  for (const s of questionary.forms[form].elements) {
    if (s.element === 'questions') {
      codes = codes.concat(s.questions)
    }
  }
  return codes
}

export function extractSubsections(questionary: IQuestionary) {
  let subsections = []
  for (const s of questionary.forms.full.sections) {
    for (const ss of s.subsections) {
      subsections.push({
        ...ss,
        section: s
      })
    }
  }
  return subsections
}

export function extractExtraLanguages(questions: string[], answers: {[key:string]: any}, languages: {[key:string]: LocalizedString}) {
  let extraLanguages: string[] = []
  const languageCodes = Object.keys(languages)
  for (const code of questions) {
    const q = questionary.questions[code]
    if (q.type === 'choose-language') {
      for (const l of answers[code]) {
        if (!extraLanguages.includes(l) && !languageCodes.includes(l)) {
          extraLanguages.push(l)
        }
     }
    }
  }
  return extraLanguages
}

export function extractLevels(questionary: IQuestionary): string[] {
  return Object.values(questionary.competenceValues).reduce(
    (levels: string[], x) => ((levels.includes(x.level)) ? levels : [...levels, x.level]), 
    [])
}

export function getPhrase(s: keyof typeof questionary.phrases, lang: LanguageCode) {
  return questionary.phrases[s][lang] || `${lang}: ${questionary.phrases[s]['it']}`
}

export type LanguageCode = typeof languageCodes[number]

export interface LocalizedString {
  [key: LanguageCode]: string
}

export type LocalizedLanguages = {
  [key: LanguageCode]: LocalizedString
}

export interface LocalizedStringWithCode extends LocalizedString {
    code: string,
}

export interface IQuestionary {
  version: string,
  phrases: {
    [key: string]: LocalizedString,
  }
  translations: {
    'it': string,
    'fu': string,
    'en': string,
  }
  languages: {
      [key: string]: LocalizedString,
  },
  languagesExtended: {
      [key: string]: LocalizedString,
  },
  ages: LocalizedStringWithCode[],
  competences: LocalizedStringWithCode[],
  competenceValues: {
      [key: string]: ICompetenceValue,
  },
  questions: {[key: string] : IQuestion},
  forms: {
    [key: string]: IForm,
  },
}

export interface IForm {
  intro: LocalizedString,
  elements: IFormElement[],
}

export type IFormElement = IFormSection | IFormTitle | IFormQuestions | IFormNewPage

export type IFormSection = {
  element: 'section',
  title: LocalizedString,
}

export type IFormTitle = {
  element: 'title',
  title: LocalizedString,
}

export type IFormQuestions = {
  element: 'questions',
  questions: string[],
}

export type IFormNewPage = {
  element: 'newpage',
}

export interface IQuestion {
    type: string,
    question: LocalizedString,
}

export interface ICompetenceValue extends LocalizedString {
  level: string,
}

export interface IReport {
  elements: IReportElement[],
}

export interface IReportElement {
  type: string,
  ref: string,
}



