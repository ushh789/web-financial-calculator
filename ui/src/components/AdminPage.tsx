import CreateCalculatorForm from './CreateCalculatorForm'

type AdminPageProps = {
  onBack: () => void
}

const AdminPage = ({ onBack }: AdminPageProps) => {
  return (
    <section className="admin">

      <CreateCalculatorForm onBack={onBack} />
    </section>
  )
}

export default AdminPage
