import assert from "assert"

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
      'en': 'Linguistic Photography',
    },
    compileButton: {
      'it': 'Compila il questionario',
      'fu': 'Compile il cuestionari',
      'en': 'Fill the Questionnarie'
      
    },
    shareButton: {
      'it': "Copia l'indirizzo del questionario",
      'fu': 'Copie il leam al cuestionari',
      'en': 'Copy the link',
    },
    thanksTitle: {
      'it': 'Grazie!',
      'fu': 'Graciis!',
      'en': 'Thank you!',
    },
    thanks: {
      'it': 'Grazie per aver compilato il questionario!',
      'fu': 'Graciis par vê compilât il cuestionari',
      'en': 'Thank you for filling the Questionnaire',
    },
    closeThisPage: {
      'it': 'Puoi chiudere questa pagina', 
      'fu': 'Tu puedis sierâ cheste pagjine',
      'en': 'Close this page',
    },
    isClosed: {
      'it': 'Il questionario è chiuso',
      'fu': 'Il cuestionari al è sierât',
      'en': 'The questionnaire is locked',
    },
    chooseLanguage: {
      'it': "usa l'italiano per compilare il questionario",
      'fu': 'compile il cuestionari par furlan',
      'en': 'fill the questionnaire in English',
    },
    prevButton: {
      'it': 'Indietro',
      'fu': 'Indaûr',
      'en': 'Previous',
    },
    nextButton: {
      'it': 'Avanti',
      'fu': 'Indenant',
      'en': 'Next',
    },
    endButton: {
      'it': 'Fine',
      'fu': 'Fin',
      'en': 'End',
    },
    sendButton: {
      'it': 'Invia',
      'fu': 'Mande',
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
      en: 'Italian',
    },
    fu: {
      it: 'Friulano',
      fu: 'Furlan',
      en: 'Friulian',
    },
    de: {
      it: 'Tedesco',
      fu: 'Todesc',
      en: 'German',
    },
    sl: {
      it: 'Sloveno',
      fu: 'Sloven',
      en: 'Slovenian',
    },
  },

  languagesExtended: {
    it: {
      it: 'Italiano',
      fu: 'Talian',
      en: 'Italian',
    },
    fu: {
      it: 'Friulano (o varianti)',
      fu: 'Furlan (o variantis)',
      en: 'Friulian (any variety)',
    },
    de: {
      it: 'Tedesco',
      fu: 'Todesc',
      en: 'German',
    },
    sl: {
      it: 'Sloveno',
      fu: 'Sloven',
      en: 'Slovenian',
    },
  },

  ages: [
    { 
      code: '',
      it: 'Mai (non so la lingua)',
      fu: 'Mai (no cognòs la lenghe)',
      en: ' Never (I don’t know the language)',
    },
    { 
      code: '0-3',
      it: '0-3 anni',
      fu: '0-3 agns',
      en: '0-3 years old',
    },
    {
      code: '3-6',
      it: '3-6 anni',
      fu: '3-6 agns',
      en: '3-6 years old',
    },
    {
      code: '6-9',
      it: '6-9 anni',
      fu: '6-9 agns',
      en: '6-9 years old',
    },
    {
      code: '9-12',
      it: '9-12 anni',
      fu: '9-12 agns',
      en: '9-12 years old',
    },
    {
      code: '12-15',
      it: '12-15 anni',
      fu: '12-15 agns',
      en: '12-15 years old',
    },
  ],

  competences: [
    {
      code: "CO",
      it: "Comprensione orale",
      fu: 'Comprension orâl',
      en: 'Oral comprehension',
    },	
    {
      code: "CS",
      it: "Comprensione scritta",
      fu: 'Comprension scrite',
      en: 'Written comprehension',
    },
    {
      code: "PO",
      it: "Produzione orale",
      fu: 'Produzion orâl',
      en: 'Oral production',
    },
    {
      code: "PS",
      it: "Produzione scritta",
      fu: 'Produzion scrite',
      en: 'Written production',
    }
  ],
  competenceValues: {
    _: {
      level: '0',
      it: "Scegli",
      fu: 'Sielç',
      en: 'Choose',
    },
    _0: { 
      level: '0',
      it: "Nessuna competenza",
      fu: "Nissune competence",
      en: 'No proficiency',
    },
    _1: {
      level: '0',
      it: "Nessuna competenza",
      fu: "Nissune competence",
      en: 'No proficiency',
    },
    _2: {
      level: '0',
      it: "Nessuna competenza",
      fu: "Nissune competence",
      en: 'No proficiency',
    },
    _3: {
      level: 'A',
      it: "Competenza iniziale",
      fu: "Competence iniziâl",
      en: 'Initial proficiency',
    },
    _4: {
      level: 'A',
      it: "Competenza iniziale",
      fu: "Competence iniziâl",
      en: 'Initial proficiency',
    },
    _5: {
      level: 'A',
      it: "Competenza iniziale",
      fu: "Competence iniziâl",
      en: 'Initial proficiency',
    },
    _6: {
      level: 'B',
      it: "Competenza intermedia",
      fu: "Competence intermedie",
      en: 'Inermediate proficiency',
    },
    _7: {
      level: 'B',
      it: "Competenza intermedia",
      fu: "Competence intermedie",
      en: 'Inermediate proficiency',
    },
    _8: {
      level: 'C',
      it: "Competenza avanzata",
      fu: "Competence avanzade",
      en: 'Advanced proficiency',
    },
    _9: {
      level: 'C',
      it: "Competenza avanzata",
      fu: "Competence avanzade",
      en: 'Advanced proficiency',
    },
    _10: {
      level: 'C',
      it: "Competenza avanzata",
      fu: "Competence avanzade",
      en: 'Advanced proficiency',
    },
  },

  questions:{
    "family": {
      type: "choose-language",
      question: {
        it: "Quali lingue vengono abitualmente utilizzate nella tua famiglia? (puoi indicare più di una risposta)",
        fu: "Cualis lenghis si doprìno in mût abituâl te tô famee? (tu puedis segnâ plui di une rispueste)", 
      },
    },
    "friends": {
      type: "choose-language",
      question: {
        it: "Quali lingue vengono abitualmente utilizzate nel tuo gruppo di amici? (puoi indicare più di una risposta)",
        fu: "Cualis lenghis si doprìno in mût abituâl tal to grup di amîs? (tu puedis segnâ plui di une rispueste)", 
      },
    },
    "competences": {
      type: "map-language-to-competence",
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
        en: "In my family we speak ...",
      }
    },
    "1.1.b.1": {
      type: "choose-language",
      question: {
        it: "a mia mamma parlo in...",
        fu: "cun mê mari o feveli par ...",
        en: "With my mother I speak ...",
      }
    },
    "1.1.b.2": {
      type: "choose-language",
      question: {
        it: "a mio papà parlo in...",
        fu: "cun mê mari o feveli par ...",
        en: "With my father I speak ...",
      }
    },
    "1.1.b.3": {
      type: "choose-language",
      question: {
        it: "ai miei fratelli/sorelle parlo in...",
        fu: "cui miei fradis / cu lis mês sûrs o feveli par ...",
        en: "With my siblings I speak ...",
      }
    },
    "1.1.b.4": {
      type: "choose-language",
      question: {
        it: "ai miei nonni parlo in...",
        fu: "cui miei nonos o feveli par ...",
        en: "With my grandparents I speak ...",
      }
    },
    "1.1.c.1": {
        type: "choose-language",
        question: {
          it: "i miei genitori tra di loro parlano...",
          fu: "i miei gjenitôrs fra di lôr a feveli par ...",
          en: "My parents speak to each other in ...",
        }
      },
    "1.1.c.2": {
        type: "choose-language",
        question: {
          it: "mia madre a me parla in...",
          fu: "mê mari mi fevele par ...",
          en: "My mother speaks to me in ...",
        }
      },
    "1.1.c.3": {
        type: "choose-language",
        question: {
          it: "mio padre a me parla in...",
          fu: "gno pari mi fevele par ...",
          en: "My father speaks to me in ...",
        }
      },
      "1.1.c.4": {
        type: "choose-language",
        question: {
          it: "i miei fratelli/sorelle a me parlano in...",
          fu: "i miei fradis / lis mês sûrs mi fevelin par ...",
          en: "My siblings speak to me in ...",
        }
      },
      "1.1.c.5": {
        type: "choose-language",
        question: {
          it: "i miei nonni a me parlano in...",
          fu: "i miei nonos mi fevelin par ...",
          en: "My grandparents speak to me in ...",
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
      name: 'completo',
      intro: {
        it: `Cara studentessa / Caro studente, 
        chiediamo la tua gentile collaborazione per rispondere alle seguenti domande 
        relative alla tuaconoscenza delle lingue. 
        Il questionario ci aiuterà a raccogliere informazioni 
        per valutare iniziative daproporre agli studenti della tua classe e dell'istituto. 
        Il questionario è anonimo: esprimiti con libertà e sincerità. 
        Grazie per la collaborazione!
        `,
        fu: `Cjare studentesse / Cjâr student, o domandìn la tô colaborazion par rispuindi 
             a lis domandis di chest cuestionari sui ûs linguistics e sui contescj comunicatîfs che tu vivis 
             (in famee, cui amîs, a scuele...). Lis rispuestis a judaran i tiei insegnants a cjapâ sù informazions 
             par fâ miôr il lôr lavôr e par pensâ gnovis iniziativis di proponi ae tô classe e al to istitût. 
             Il cuestionari al è anonim: esprimiti cun libertât e scletece!
             Grazie pe colaborazion!
        `,
        en: `Dear student, please help us by answering the following questions about the languages used in different communication settings of your life 
             (your family, your friend group, at school...). This survey lets us collect information to improve school activities and to assess possible activities 
             to offer to your class and your school. The survey is anonymous: please share your thoughts in freedom and sincerity.
             Thank you for your help!
        `,
      },  
      elements: [
        { 
          element: "section",
          title: {
            it: "Lingue parlate e contesti comunicativi",
            fu: "Lenghis feveladis e contescj comunicatîfs",
            en: "Spoken languages and communication settings",
          },
        },
        {
          element: "title",
          title: {
            it: "Abitualmente...",
            fu: "Pal solit ...",
            en: "Usually ...",
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
            en: "In my family we usually speak ...",
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
            en: "In my family we usually ...",
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
            en: "When I’m out I usually speak ...",
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
            fu: "A scuele pal solit ...",
            en: "When I’m at school I usually speak ...",
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
            en: "Usually ...",
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
            en: "Oral and written language proficiency",
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
      ],
      report: [
        {
          element: "title",
          title: "Risultati aggregati",
        },
        {
          element: "info",
        },
        {
          element: "chart",
          question: "1.1.a.1", 
          title: "Nella mia famiglia si parla abitualmente",
        },
        {
          element: "chart",
          variant: "count",
          question: "1.1.a.1",
          title: "Numero di lingue parlate in famiglia",
        },
        {
          element: "chart",
          title: "Competenze linguistiche autovalutate",
          question: "2.2.1",
        },
        {
          element: "table",
          question: "2.2.1",
        },
        {
          element: "chart",
          title: "A che età hai cominciato a parlare le lingue che conosci?",
          question: "2.1.1",
        },
      ],
    },
    short: {
      name: "breve",
      intro: {
        it: `Cara studentessa / Caro studente, 
        chiediamo la tua gentile collaborazione per rispondere alle seguenti domande 
        relative alla tuaconoscenza delle lingue. 
        Il questionario ci aiuterà a raccogliere informazioni 
        per valutare iniziative daproporre agli studenti della tua classe e dell'istituto. 
        Il questionario è anonimo: esprimiti con libertà e sincerità. 
        Grazie per la collaborazione!
        `,
        fu: `Cjare studentesse / Cjar student, o domandìn la tô colaborazion par rispuindi 
             a lis domandis di chest cuestionari sui ûs linguistics e sui contescj comunicatîfs che tu vivis 
             (in famee, cui amîs, a scuele...). Lis rispuestis a judaran i tiei insegnants a cjapâ sù informazions 
             par fâ miôr il lôr lavôr e par pensâ gnovis iniziativis di proponi ae tô classe e al to istitût. 
             Il cuestionari al è anonim: esprimiti cun libertât e scletece!
             Grazie pe colaborazion!
        `,
      },
      elements : [
        { 
          element: "section",
          title: {
            it: "Istantanea linguistica",
            fu: "Istantanie linguistiche",
          },
        },
        {
          element: "title",
          title: {
            it: "Lingue parlate e contesti comunicativi",
            fu: "Langhis feveladis e contescj comunicatîfs",
          },
        },
        { 
          element: "questions",
          questions: [ "family", "friends" ],
        },
        { element: "newpage" },
        {
          element: "title",
          title: {
            it: "Competenza linguistica orale e scritta",
            fu: "Competence linguistiche orâl e scrite",
          },
        },
        { 
          element: "questions",
          questions: [ "competences" ],
        },
      ],
      report: [
        {
          element: "title",
          title: "Istantanea linguistica",
        },
        {
          element: "info",
        },
        {
          element: "chart",
          question: "family",
          title: "Lingue parlate in famiglia",
        },
        {
          element: "chart",
          question: "friends",
          title: "Lingue parlate con gli amici",
        },
        {
          element: "chart",
          title: "Competenze linguistiche autovalutate",
          question: "competences",
        },
        {
          element: "table",
          question: "competences",
        },
      ]
    }
  }
}

export default questionary

export function extractQuestionCodes(form: string) {
  let codes: string[] = []
  assert(questionary.forms[form], `form "${form}" not found`)
  for (const s of questionary.forms[form].elements) {
    if (s.element === 'questions') {
      codes = codes.concat(s.questions)
    }
  }
  return codes
}

export function extractPages(form: string) {
  let pages = []
  let page = []
  let lastSection = null
  for (const item of questionary.forms[form].elements) {
    if (item.element === 'newpage') {
      pages.push(page)
      page = []
      if (lastSection) {
        page.push(lastSection)
      }
    } else {
      page.push(item)
    }
  if (item.element === 'section') {
    // repeat on every new page
    lastSection = item
  }
}
  pages.push(page)
  return pages
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

export function trans(s: {[key:string]: string}, lang: string) {
  return s[lang] || `${lang}: ${s.it||'???'}`
}

export function getPhrase(s: keyof typeof questionary.phrases, lang: LanguageCode) {
  return trans(questionary.phrases[s], lang)
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
  name: string,
  intro: LocalizedString,
  elements: IFormElement[],
  report: IReportElement[],
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
    type: 'choose-language' | 'map-language-to-competence' | 'map-language-to-age',
    question: LocalizedString,
}

export interface ICompetenceValue extends LocalizedString {
  level: string,
}

export type IReportElement = 
  IReportTitleElement | 
  IReportInfoElement | 
  IReportChartElement |
  IReportTableElement

export type IReportTitleElement = {
  element: 'title',
  title: string,
}

export type IReportInfoElement = {
  element: 'info',
}

export type IReportChartElement = {
  element: 'chart',
  title?: string,
  question: string,
  variant?: 'chart'|'count',
}

export type IReportTableElement = {
  element: 'table',
  title?: string,
  question: string,
}
