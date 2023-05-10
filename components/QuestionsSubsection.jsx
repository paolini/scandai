import Question from './Question'

export default function QuestionsSubsection({ subsection, answers, setAnswers, data, extraLanguages }) {
  return <div key={subsection.code}>
    { subsection.title  && <h4>{subsection.title.it}</h4> }
    {
      subsection.questions.map(q => 
        <Question 
          key={q.code} 
          question={q}
          answer={answers[q.code]}
          data={data}
          extraLanguages={extraLanguages}
          setAnswer={(a) => setAnswers(answers => ({
            ...answers, 
            [q.code]: typeof(a) === 'function' 
              ? a(answers[q.code])
              : a
          }))}
        />)
    }
  </div>
}
