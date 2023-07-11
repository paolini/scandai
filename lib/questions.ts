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
  languages: {
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
      level: '0'
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
      fu: "Competence avanzade",
    },
  },
  sections : [
    {
      code: "1",
      title: {
        it: "Lingue parlate e contesti comunicativi"
      },
      subsections: [
        {
          code: "1.1.a",
          title: {
            it: "Abitualmente..."
          },
          questions: [
            {
              code: "1.1.a.1",
              type: "choose-language",
              question: {
                it: "nella mia famiglia si parla..."
              }
            },
          ],
        },
        {
          code: "1.1.b",
          title: {
            it: "In famiglia abitualmente io parlo..."
          },
          questions: [
            {
              code: "1.1.b.1",
              type: "choose-language",
              question: {
                it: "a mia mamma parlo in..."
              }
            },
            {
              code: "1.1.b.2",
              type: "choose-language",
              question: {
                it: "a mio papà parlo in..."
              }
            },
            {
              code: "1.1.b.3",
              type: "choose-language",
              question: {
                it: "ai miei fratelli/sorelle parlo in..."
              }
            },
            {
              code: "1.1.b.4",
              type: "choose-language",
              question: {
                it: "ai miei nonni parlo in..."
              }
            },
          ],
        },
        {
          code: "1.1.c",
          title: {
            it: "In famiglia abitualmente..."
          },
          questions: [
            {
              code: "1.1.c.1",
              type: "choose-language",
              question: {
                it: "i miei genitori tra di loro parlano..."
              }
            },
            {
              code: "1.1.c.2",
              type: "choose-language",
              question: {
                it: "mia madre a me parla in..."
              }
            },
            {
              code: "1.1.c.3",
              type: "choose-language",
              question: {
                it: "mio padre a me parla in..."
              }
            },
            {
              code: "1.1.c.4",
              type: "choose-language",
              question: {
                it: "i miei fratelli/sorelle a me parlano in..."
              }
            },
            {
              code: "1.1.c.5",
              type: "choose-language",
              question: {
                it: "i miei nonni a me parlano in..."
              }
            },
          ],
        },
        {
          code: "1.2.a",
          title: {
            it: "Fuori casa abitualmente io parlo..."
          },
          questions: [
            {
              code: "1.2.a.1",
              type: "choose-language",
              question: {
                it: "ai miei amici parlo in..."
              }
            },
            {
              code: "1.2.a.2",
              type: "choose-language",
              question: {
                it: "alle persone dei negoziparlo in..."
              }
            },
            {
              code: "1.2.a.3",
              type: "choose-language",
              question: {
                it: "agli adulti del miopaese/città/quartiere parlo in..."
              }
            },
            {
              code: "1.2.a.4",
              type: "choose-language",
              question: {
                it: "1.2.b. Fuori casa abitualmente..."
              }
            },
            {
              code: "1.2.a.5",
              type: "choose-language",
              question: {
                it: "i miei amici a me parlano in..."
              }
            },
            {
              code: "1.2.a.6",
              type: "choose-language",
              question: {
                it: "le persone dei negozi a me parlano in..."
              }
            },
            {
              code: "1.2.a.7",
              type: "choose-language",
              question: {
                it: "gli adulti del mio paese/città/quartiere a me parlano in..."
              }
            },
            {
              code: "1.2.a.8",
              type: "choose-language",
              question: {
                it: "1.3.a. A scuola abitualmente io parlo..."
              }
            },
            {
              code: "1.2.a.9",
              type: "choose-language",
              question: {
                it: "ai miei compagni di classe parlo in..."
              }
            },
            {
              code: "1.2.a.10",
              type: "choose-language",
              question: {
                it: "ai professori parlo in... (esclusi quelli di lingue)"
              }
            },
          ],
        },
        {
          code: "1.3.b",
          title: {
            it: "A scuola abitualmente..."
          },
          questions: [
            {
              code: "1.3.b.1",
              type: "choose-language",
              question: {
                it: "i miei compagni di classe a me parlano in..."
              }
            },
            {
              code: "1.3.b.2",
              type: "choose-language",
              question: {
                it: "i professori a me parlano in... (esclusi quelli di lingue straniere)"
              }
            },
          ],
        },
        {
          code: "1.4",
          title: {
            it: "Abitualmente..."
          },
          questions: [
            {
              code: "1.4.1",
              type: "choose-language",
              question: {
                it: "quali lingue usi quando telefoni agli amici?"
              }
            },
            {
              code: "1.4.2",
              type: "choose-language",
              question: {
                it: "quali lingue usi nelle mail, sui social e nelle chat?"
              }
            },
            {
              code: "1.4.3",
              type: "choose-language",
              question: {
                it: "quali lingue vengono usate nei programmi TV che guardi?"
              }
            },
            {
              code: "1.4.4",
              type: "choose-language",
              question: {
                it: "quali lingue vengono usate nei siti internet che visiti?"
              }
            },
            {
              code: "1.4.5",
              type: "choose-language",
              question: {
                it: "in quali lingue sono scritti i libri, le storie e i fumetti che leggi?"
              }
            },
          ]
        },
      ]
    },
    {
      code: "2",
      title: {
        it: "Competenza linguistica orale e scritta"
      },
      subsections: [
        {
          code: "2.1",
          questions: [{
            code: "2.1.1",
            type: 'map-language-to-age',
            question: {
              it: "A che età hai cominciato a parlare le lingue che conosci? (indica una sola fascia d'età per ciascuna voce)"
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
