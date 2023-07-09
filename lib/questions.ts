export const languageCodes = ['it','fu','sl','de']
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

export interface IQuestion {
    code: string,
    type: string,
    question: LocalizedString,
}

export interface ISubsection {
    code: string,
    title?: LocalizedString,
    questions: IQuestion[],
}

export interface ISection {
    code: string,
    title: LocalizedString,
    subsections: ISubsection[],
}

export interface ICompetenceValue extends LocalizedString {
  level: string,
}

export interface IQuestions {
    version: string,
    submitMessage: LocalizedString,
    languages: {
        [key: string]: LocalizedString,
    },
    ages: LocalizedStringWithCode[],
    competences: LocalizedStringWithCode[],
    competenceValues: {
        [key: string]: ICompetenceValue,
    },
    sections: ISection[],    
}

const questions : IQuestions = {
  version: "0.1.0",
  submitMessage: {
    it: "Grazie per aver compilato il questionario!",
  },
  languages: {
    it: {
      it: 'Italiano',
      fu: 'Talian-',
      de: 'Italienisch-',
      sl: 'Italijanščina-',
    },
    fu: {
      it: 'Friulano',
      fu: 'Furlan-',
      de: 'Friaulisch-',
      sl: 'Furlanščina-',
    },
    de: {
      it: 'Tedesco',
      fu: 'Tedesch-',
      de: 'Deutsch-',
      sl: 'Nemščina-',      
    },
    sl: {
      it: 'Sloveno',
      fu: 'Sloven-',
      de: 'Slowenisch-',
      sl: 'Slovenščina-',
    },
  },
  ages: [
    { 
      code: '',
      it: 'Mai (non so la lingua)',
      fu: 'Mai (no sai la lenghe)-',
      de: 'Nie (ich kenne die Sprache nicht)-',
      sl: 'Nikoli (ne poznam jezika)-',
    },
    { 
      code: '0-3',
      it: '0-3 anni',
      fu: '0-3 agns-',
      de: '0-3 Jahre-',
      sl: '0-3 leta-',
    },
    {
      code: '3-6',
      it: '3-6 anni',
      fu: '3-6 agns-',
      de: '3-6 Jahre-',
      sl: '3-6 leta-',
    },
    {
      code: '6-9',
      it: '6-9 anni',
      fu: '6-9 agns-',
      de: '6-9 Jahre-',
      sl: '6-9 leta-',
    },
    {
      code: '9-12',
      it: '9-12 anni',
      fu: '9-12 agns-',
      de: '9-12 Jahre-',
      sl: '9-12 leta-',      
    },
    {
      code: '12-15',
      it: '12-15 anni',
      fu: '12-15 agns-',
      de: '12-15 Jahre-',
      sl: '12-15 leta-',
    },
  ],
  competences: [
    {
      code: "CO",
      it: "Comprensione orale",
      fu: "Comprension orâl-",
      de: "Hörverständnis-",
      sl: "Sporazumevanje v živo-",
    },	
    {
      code: "CS",
      it: "Comprensione scritta",
      fu: "Comprension scrite-",
      de: "Leseverständnis-",
      sl: "Sporazumevanje v pisni obliki-",
    },
    {
      code: "PO",
      it: "Produzione orale",
      fu: "Produzion orâl-",
      de: "Mündliche Produktion-",
      sl: "Govorno sporazumevanje-",
    },
    {
      code: "PS",
      it: "Produzione scritta",
      fu: "Produzion scrite-",
      de: "Schriftliche Produktion-",
      sl: "Pisno sporazumevanje-",
    }
  ],
  competenceValues: {
    _: {
      level: '0',
      it: "Scegli...",
      fu: "Scei...-",
      de: "Wähle...-",
      sl: "Izberi...-",
    },
    _0: { 
      level: '0',
      it: "Nessuna competenza",
      fu: "Nissune competence-",
      de: "Keine Kompetenz-",
      sl: "Brez kompetenc-",
    },
    _1: {
      level: '0',
    },
    _2: {
      level: '0'
    },
    _3: {
      level: 'A',
    },
    _4: {
      level: 'A',
    },
    _5: {
      level: 'A',
    },
    _6: {
      level: 'B',
    },
    _7: {
      level: 'B',
    },
    _8: {
      level: 'C',
    },
    _9: {
      level: 'C',
    },
    _10: {
      level: 'C',
      it: "Competenza avanzata",
      fu: "Competence avanzade-",
      de: "Fortgeschrittene Kompetenz-",
      sl: "Napredne kompetence-",
    },
  },
  sections : [
    {
      code: "1",
      title: {
        it: "Lingue parlate e contesti comunicativi",
        fu: "Lenghis paradis e contestis comunicativs-",
        de: "Gesprochene Sprachen und Kommunikationskontexte-",
        sl: "Govorjene jezike in komunikacijske kontekste-",
      },
      subsections: [
        {
          code: "1.1.a",
          title: {
            it: "Abitualmente...",
            fu: "Abitualment...-",
            de: "Gewöhnlich...-",
            sl: "Običajno...-",
          },
          questions: [
            {
              code: "1.1.a.1",
              type: "choose-language",
              question: {
                it: "nella mia famiglia si parla...",
                fu: "intal mê fumìlie si parle...-",
                de: "in meiner Familie spricht man...-",
                sl: "v moji družini se govori...-",
              }
            },
          ],
        },
        {
          code: "1.1.b",
          title: {
            it: "In famiglia abitualmente io parlo...",
            fu: "Intal mê fumìlie abitualment jo parle...-",
            de: "In meiner Familie spreche ich gewöhnlich...-", 
            sl: "V družini običajno govorim...-",
          },
          questions: [
            {
              code: "1.1.b.1",
              type: "choose-language",
              question: {
                it: "a mia mamma parlo in...",
                fu: "a mê mame parle in...-",
                de: "mit meiner Mutter spreche ich...-",
                sl: "mami govorim v...-",
              }
            },
            {
              code: "1.1.b.2",
              type: "choose-language",
              question: {
                it: "a mio papà parlo in...",
                fu: "a mê pari parle in...-",
                de: "mit meinem Vater spreche ich...-",
                sl: "očetu govorim v...-",
              }
            },
            {
              code: "1.1.b.3",
              type: "choose-language",
              question: {
                it: "ai miei fratelli/sorelle parlo in...",
                fu: "ai mês fradis/sororis parle in...-",
                de: "mit meinen Geschwistern spreche ich...-",
                sl: "bratom/sestram govorim v...-",
              }
            },
            {
              code: "1.1.b.4",
              type: "choose-language",
              question: {
                it: "ai miei nonni parlo in...",
                fu: "ai mês nonis parle in...-",
                de: "mit meinen Großeltern spreche ich...-",
                sl: "starkim staršem govorim v...-",
              }
            },
          ],
        },
        {
          code: "1.1.c",
          title: {
            it: "In famiglia abitualmente...",
            fu: "Intal mê fumìlie abitualment...-",
            de: "In meiner Familie sprechen wir gewöhnlich...-",
            sl: "V družini običajno govorimo...-",
          },
          questions: [
            {
              code: "1.1.c.1",
              type: "choose-language",
              question: {
                it: "i miei genitori tra di loro parlano...",
                fu: "i mês genitôrs tra di lôr parle...-",
                de: "meine Eltern sprechen untereinander...-",
                sl: "moji starši med seboj govorita...-",
              }
            },
            {
              code: "1.1.c.2",
              type: "choose-language",
              question: {
                it: "mia madre a me parla in...",
                fu: "mê mame a me parle in...-",
                de: "meine Mutter spricht mit mir...-",
                sl: "mama meni govori v...-",
              }
            },
            {
              code: "1.1.c.3",
              type: "choose-language",
              question: {
                it: "mio padre a me parla in...",
                fu: "mê pari a me parle in...-",
                de: "mein Vater spricht mit mir...-",
                sl: "oče meni govori v...-",
              }
            },
            {
              code: "1.1.c.4",
              type: "choose-language",
              question: {
                it: "i miei fratelli/sorelle a me parlano in...",
                fu: "i mês fradis/sororis a me parle in...-",
                de: "meine Geschwister sprechen mit mir...-",
                sl: "bratje/sestre meni govorijo v...-",
              }
            },
            {
              code: "1.1.c.5",
              type: "choose-language",
              question: {
                it: "i miei nonni a me parlano in...",
                fu: "i mês nonis a me parle in...-",
                de: "meine Großeltern sprechen mit mir...-",
                sl: "starki starši meni govorijo v...-",
              }
            },
          ],
        },
        {
          code: "1.2.a",
          title: {
            it: "Fuori casa abitualmente io parlo...",
            fu: "Fûr di cjase abitualment jo parle...-",
            de: "Außerhalb des Hauses spreche ich gewöhnlich...-",
            sl: "Običajno govorim...-",
          },
          questions: [
            {
              code: "1.2.a.1",
              type: "choose-language",
              question: {
                it: "ai miei amici parlo in...",
                fu: "ai mês amis parle in...-",
                de: "mit meinen Freunden spreche ich...-",
                sl: "prijateljem govorim v...-",
              }
            },
            {
              code: "1.2.a.2",
              type: "choose-language",
              question: {
                it: "alle persone dei negoziparlo in...",
                fu: "a dutis lis personis dai negozis parle in...-",
                de: "mit den Leuten in den Geschäften spreche ich...-",
                sl: "osebam v trgovinah govorim v...-",
              }
            },
            {
              code: "1.2.a.3",
              type: "choose-language",
              question: {
                it: "agli adulti del miopaese/città/quartiere parlo in...",
                fu: "a ducj i adulds dal mê paîs/citât/quartîr parle in...-",
                de: "mit den Erwachsenen in meinem Dorf/Stadt/Viertel spreche ich...-",
                sl: "odraslim v moji vasi/mestu/soseski govorim v...-",
              }
            },
            {
              code: "1.2.a.4",
              type: "choose-language",
              question: {
                it: "1.2.b. Fuori casa abitualmente...",
                fu: "Fûr di cjase abitualment...-",
                de: "Außerhalb des Hauses sprechen wir gewöhnlich...-",
                sl: "Običajno govorimo...-",
              }
            },
            {
              code: "1.2.a.5",
              type: "choose-language",
              question: {
                it: "i miei amici a me parlano in...",
                fu: "i mês amis a me parle in...-",
                de: "meine Freunde sprechen mit mir...-",
                sl: "prijatelji meni govorijo v...-",
              }
            },
            {
              code: "1.2.a.6",
              type: "choose-language",
              question: {
                it: "le persone dei negozi a me parlano in...",
                fu: "lis personis dai negozis a me parle in...-",
                de: "die Leute in den Geschäften sprechen mit mir...-",
                sl: "osebe v trgovinah meni govorijo v...-",
              }
            },
            {
              code: "1.2.a.7",
              type: "choose-language",
              question: {
                it: "gli adulti del mio paese/città/quartiere a me parlano in...",
                fu: "i adulds dal mê paîs/citât/quartîr a me parle in...-",
                de: "die Erwachsenen in meinem Dorf/Stadt/Viertel sprechen mit mir...-",
                sl: "-"
              }
            },
            {
              code: "1.2.a.8",
              type: "choose-language",
              question: {
                it: "1.3.a. A scuola abitualmente io parlo...",
                fu: "A scuele abitualment jo parle...-",
                de: "In der Schule spreche ich gewöhnlich...-",
                sl: "V šoli običajno govorim...-",
              }
            },
            {
              code: "1.2.a.9",
              type: "choose-language",
              question: {
                it: "ai miei compagni di classe parlo in...",
                fu: "ai mês compagns di clâs parle in...-",
                de: "mit meinen Mitschülern spreche ich...-",
                sl: "sošolcem govorim v...-",
              }
            },
            {
              code: "1.2.a.10",
              type: "choose-language",
              question: {
                it: "ai professori parlo in... (esclusi quelli di lingue)",
                fu: "ai profesôrs parle in... (esclusi chei di lenghis)-",
                de: "mit den Lehrern spreche ich... (außer den Sprachlehrern)-",  
                sl: "učiteljem govorim v... (razen učiteljev jezikov)-",
              }
            },
          ],
        },
        {
          code: "1.3.b",
          title: {
            it: "A scuola abitualmente...",
            fu: "A scuele abitualment...-",
            de: "In der Schule sprechen wir gewöhnlich...-",
            sl: "V šoli običajno govorimo...-",
          },
          questions: [
            {
              code: "1.3.b.1",
              type: "choose-language",
              question: {
                it: "i miei compagni di classe a me parlano in...",
                fu: "i mês compagns di clâs a me parle in...-",
                de: "meine Mitschüler sprechen mit mir...-",
                sl: "sošolci meni govorijo v...-",               
              }
            },
            {
              code: "1.3.b.2",
              type: "choose-language",
              question: {
                it: "i professori a me parlano in... (esclusi quelli di lingue straniere)",
                fu: "i profesôrs a me parle in... (esclusi chei di lenghis straniêrs)-",
                de: "die Lehrer sprechen mit mir... (außer den Sprachlehrern)-",
                sl: "učitelji meni govorijo v... (razen učiteljev jezikov)-",
              }
            },
          ],
        },
        {
          code: "1.4",
          title: {
            it: "Abitualmente...",
            fu: "Abitualment...-",
            de: "Gewöhnlich...-",
            sl: "Običajno...-",
          },
          questions: [
            {
              code: "1.4.1",
              type: "choose-language",
              question: {
                it: "quali lingue usi quando telefoni agli amici?",
                fu: "qualis lenghis usis cuant che telefones a mês amis?-",
                de: "welche Sprachen benutzt du, wenn du mit Freunden telefonierst?",
                sl: "katere jezike uporabljaš, ko telefoniraš prijateljem?",
              }
            },
            {
              code: "1.4.2",
              type: "choose-language",
              question: {
                it: "quali lingue usi nelle mail, sui social e nelle chat?",
                fu: "qualis lenghis usis tes mails, sui social e tes chats?-",
                de: "welche Sprachen benutzt du in E-Mails, auf Social Media und in Chats?",
                sl: "katere jezike uporabljaš v e-pošti, na družbenih omrežjih in v klepetu?",
              }
            },
            {
              code: "1.4.3",
              type: "choose-language",
              question: {
                it: "quali lingue vengono usate nei programmi TV che guardi?",
                fu: "qualis lenghis vengonis usadis tes programs TV che tu viodis?-",
                de: "welche Sprachen werden in den Fernsehsendungen benutzt, die du schaust?",
                sl: "katere jezike uporabljajo v televizijskih oddajah, ki jih gledaš?",
              }
            },
            {
              code: "1.4.4",
              type: "choose-language",
              question: {
                it: "quali lingue vengono usate nei siti internet che visiti?",
                fu: "qualis lenghis vengonis usadis tes sîts internet che tu visitis?-",
                de: "welche Sprachen werden auf den Internetseiten benutzt, die du besuchst?",
                sl: "katere jezike uporabljajo na spletnih straneh, ki jih obiskuješ?",
              }
            },
            {
              code: "1.4.5",
              type: "choose-language",
              question: {
                it: "in quali lingue sono scritti i libri, le storie e i fumetti che leggi?",
                fu: "in qualis lenghis a son scrits i libris, lis stôris e i fumets che tu lis levis?-",
                de: "in welchen Sprachen sind die Bücher, Geschichten und Comics geschrieben, die du liest?",
                sl: "v katerih jezikih so napisane knjige, zgodbe in stripe, ki jih bereš?",
              }
            },
          ]
        },
      ]
    },
    {
      code: "2",
      title: {
        it: "Competenza linguistica orale e scritta",
        fu: "Competence lenghistiche orâl e scrite-",
        de: "Mündliche und schriftliche Sprachkompetenz-",
        sl: "Govorne in pisne jezikovne kompetence-",
      },
      subsections: [
        {
          code: "2.1",
          questions: [{
            code: "2.1.1",
            type: 'map-language-to-age',
            question: {
              it: "A che età hai cominciato a parlare le lingue che conosci? (indica una sola fascia d'età per ciascuna voce)",
              fu: "A che etât tu âs comensât a parâ le lenghis che tu cognossis? (indiche une sole fascie d'etât par ducj i voçs)",
              de: "In welchem Alter hast du angefangen, die Sprachen zu sprechen, die du kennst? (gib für jede Sprache nur eine Altersgruppe an)",
              sl: "Pri kateri starosti si začel govoriti jezike, ki jih poznaš? (za vsak jezik navedi samo eno starostno skupino)",
            }
        }],
      },
      { 
        code: "2.2",
        questions: [{
          code: "2.2.1",
          type: 'map-language-to-competence',
          question: {
            it: "Esprimi una autovalutazione da 0 a 10 delle tue competenze linguistiche compilando la tabella seguente. (0=Nessuna competenza; 10=competenza avanzata. Se non conosci la lingua indica competenza 0)",
            fu: "Esprimi une autovalutazion da 0 a 10 des tôs competencis lenghistiche compiland la taele che al è sot. (0=Nissune competence; 10=competence avanzade. Se no tu cognossis la lenghe indiche competence 0)",
            de: "Gib eine Selbsteinschätzung deiner Sprachkompetenzen von 0 bis 10 an, indem du die folgende Tabelle ausfüllst. (0=Keine Kompetenz; 10=Fortgeschrittene Kompetenz. Wenn du die Sprache nicht kennst, gib 0 an)",
            sl: "Izrazi samopodobo svojih jezikovnih kompetenc od 0 do 10 tako, da izpolniš spodnjo tabelo. (0=Brez kompetenc; 10=Napredne kompetence. Če jezika ne poznaš, navedi kompetenco 0)",            
          }
        }],
      },
    ]
  }
  ],
}

export default questions

export function extractQuestions(data: IQuestions) {
  let questions = []
  for (const s of data.sections) {
    for (const ss of s.subsections) {
      for (const q of ss.questions) {
        questions.push(q)
      }
    }
  }
  return questions
}

export function extractSubsections(data: IQuestions) {
  let subsections = []
  for (const s of data.sections) {
    for (const ss of s.subsections) {
      subsections.push({
        ...ss,
        section: s
      })
    }
  }
  return subsections
}

export function extractExtraLanguages(questions: IQuestion[], answers: {[key:string]: any}, languages: {[key:string]: LocalizedString}) {
  let extraLanguages: string[] = []
  const languageCodes = Object.keys(languages)
  for (const q of questions) {
    if (q.type === 'choose-language') {
      for (const l of answers[q.code]) {
        if (!extraLanguages.includes(l) && !languageCodes.includes(l)) {
          extraLanguages.push(l)
        }
     }
    }
  }
  return extraLanguages
}

export function extractLevels(questions: IQuestions): string[] {
  return Object.values(questions.competenceValues).reduce(
    (levels: string[], x) => ((levels.includes(x.level)) ? levels : [...levels, x.level]), 
    [])
}
