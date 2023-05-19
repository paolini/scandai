const data = {
  languages: {
    it: {
      it: 'Italiano',
    },
    fu: {
      it: 'Friulano (o varianti)',
    },
    de: {
      it: 'Tedesco',
    },
    sl: {
      it: 'Sloveno',
    },
  },
  ages: [
    { 
      code: '',
      it: 'Mai (non so la lingua)',
    },
    { 
      code: '0-3',
      it: '0-3 anni',
    },
    {
      code: '3-6',
      it: '3-6 anni',
    },
    {
      code: '6-9',
      it: '6-9 anni',
    },
    {
      code: '9-12',
      it: '9-12 anni',
    },
    {
      code: '12-15',
      it: '12-15 anni',
    },
  ],
  competences: [
    {
      code: "CO",
      it: "Comprensione orale",
    },	
    {
      code: "CS",
      it: "Comprensione scritta",
    },
    {
      code: "PO",
      it: "Produzione orale",
    },
    {
      code: "PS",
      it: "Produzione scritta",
    }
  ],
  competenceValues: {
    _: {
      it: "Scegli...",
    },
    _0: { 
      it: "Nessuna competenza",
    },
    _1: {},
    _2: {},
    _3: {},
    _4: {},
    _5: {},
    _6: {},
    _7: {},
    _8: {},
    _9: {},
    _10: {
      it: "Competenza avanzata",
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
        },/*
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
        },*/
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

export default function handler(req, res) {
  res.status(200).json({ data })
}

