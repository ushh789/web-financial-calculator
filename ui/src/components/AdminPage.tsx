import { useState } from 'react'
import CalculatorsList from './CalculatorsList'
import CreateCalculatorForm from './CreateCalculatorForm'

type AdminPageProps = {
  onBack: () => void
  onOpenCalculator: (id: string) => void
}

const AdminPage = ({ onBack, onOpenCalculator }: AdminPageProps) => {
  const [showCreateForm, setShowCreateForm] = useState(true)

  return (
    <section className="admin">
      <CalculatorsList
        onSelectCalculator={onOpenCalculator}
        onCreateCalculator={() => setShowCreateForm(true)}
      />
      {showCreateForm && <CreateCalculatorForm onBack={onBack} />}
    </section>
  )
}

export default AdminPage
