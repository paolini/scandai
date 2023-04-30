const data = text_to_json(`
1. Lingue parlate e contesti comunicativi
1.1.a. Abitualmente...
* nella mia famiglia si parla...
1.1.b. In famiglia abitualmente io parlo...
* a mia mamma parlo in...
* a mio papà parlo in...
* ai miei fratelli/sorelle parlo in...
* ai miei nonni parlo in...
1.1.c. In famiglia abitualmente...
* i miei genitori tra di loro parlano...
* mia madre a me parla in...
* mio padre a me parla in...
* i miei fratelli/sorelle a me parlano in...
* i miei nonni a me parlano in...
1.2.a. Fuori casa abitualmente io parlo...
* ai miei amici parlo in...
* alle persone dei negoziparlo in...
* agli adulti del miopaese/città/quartiere parlo in...
* 1.2.b. Fuori casa abitualmente...
* i miei amici a me parlano in...
* le persone dei negozi ame parlano in...
* gli adulti del miopaese/città/quartiere a me parlano in...
* 1.3.a. A scuola abitualmente io parlo...
* ai miei compagni di classe parlo in...
* ai professori parlo in... (esclusi quelli di lingue)
1.3.b. A scuola abitualmente...
* i miei compagni di classea me parlano in...
* i professori a me parlanoin... (esclusi quelli di lingue straniere)
1.4. Abitualmente...
* quali lingue usi quando telefoni agli amici?
* quali lingue usi nelle mail, sui social e nelle chat?
* quali lingue vengono usate nei programmi TV che guardi?
* quali lingue vengono usate nei siti internet che visiti?
* in quali lingue sono scritti i libri, le storie e i fumetti che leggi?
1.5. A che età hai cominciato a parlare le lingue che conosci? (indica una sola fascia d'età per ciascuna voce)
2. Competenza linguistica orale e scritta
2.1. Italiano
2.2. Friulano
2.3. Sloveno
2.4. Tedesco
2.5. Inglese
2.6. lingua 1
2.7. lingua 2
`)

function text_to_json(text) {
  let questions = []
  let sections = []
  let subsections = []

  let last_code = null
  let last_count = 0
  text.split('\n')
    .filter(line => line.length > 0)
    .map(line => {
      const i = line.indexOf(' ')
      const code = line.substring(0, i)
      const question = line.substring(i + 1)
      if (code === '*') {
        last_count ++
        questions.push({
          code: `${last_code}.${last_count}`,
          question: {
            it: question,
          }
        })
      } else {
        const split = code.split('.').filter(s => s.length > 0)
        last_code = split.join('.')
        last_count = 0
        if (split.length === 1) {
          sections.push({
              code: last_code, 
              title: {
                it: question,
              }})
        } else {
          subsections.push({
              code: last_code,
              title: {
                it: question,
              }})
        }
      }
    })
    return {
      sections,
      subsections,
      questions,
    }
}

export default function handler(req, res) {
  res.status(200).json({ data })
}

