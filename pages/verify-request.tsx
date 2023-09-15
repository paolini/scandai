export default function VerifyRequestPage() {
  return (
    <div className="verify-request">
        <style
          dangerouslySetInnerHTML={{
            __html: `
        :root {
          --brand-color: #059669;
        }
      `,
          }}
        />
      <div className="card p-5">
        <h1>Controlla la tua email</h1>
        <p>Ti abbiamo inviato un messaggio con le istruzioni per entrare.</p>
        <p>Puoi chiudere questa pagina</p>
      </div>
    </div>
  )
}
