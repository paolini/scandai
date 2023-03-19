export default function handler(req, res) {
  res.status(200).json({
    data: [{
      _id: "1",
      title: "Domanda 1",
      content: "Ti piace questa domanda?",
      options: [{
          content: "Sì",
          value: "sì"
        }, {
          content: "No",
          value: "no"
        },{
          content: "Non so",
          value: ""
        }]
    }]
  })
}
