export default function handler(req, res) {
  res.status(200).json({
    data: {
      sections: [
        {
          code: '1',
          title: {
            it: 'Lingue parlate e contesti comunicativi',
          },
        },
        {
          code: '2',
          title: {
            it: 'Competenza linguistica orale e scritta',
          },
        },
      ],
      subsections: [
        {
          code: '1.1.a',
          title: {
            it: 'Abitualmente...',
          },
        },
        {
          code: '1.1.b',
          title: {
            it: 'In famiglia abitualmente io parlo...',
          }
        },
      ],
      questions: [
        {
          code: "1.1.a.1",
          question: {
            it: 'nella mia famiglia si parla...',
          },
        },
        {
          code: "1.1.b.1",
          question: {
            it: 'a mia mamma parlo in...',
          }
        },
        {
          code: "1.1.b.2",
          question: {
            it: 'a mia papà parlo in...',
          }
        },
      ],
    }
  })
}
