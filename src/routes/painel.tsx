import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/painel')({
  component: PainelPage,
})

function PainelPage() {
  return (
    <div style={{ padding: '20px', color: '#fff', backgroundColor: '#111', minHeight: '100vh' }}>
      <h1>Painel Teste OK!</h1>
      <p>Se você está vendo isso, a rota está 100% funcional.</p>
    </div>
  )
}

export default PainelPage
