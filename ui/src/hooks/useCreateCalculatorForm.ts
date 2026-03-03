import { useMemo, useState, type FormEvent } from 'react'
import { CalculatorsApi, type CreateCalculatorRequest } from '../generated'

type UiField = {
  id: string
  label: string
  type: string
  required: boolean
}

type CreateCalculatorFormState = {
  formData: {
    code: string
    name: string
    description: string
    algorithmEngine: string
    algorithmInputs: string
    algorithmOutputs: string
    uiTitle: string
  }
  uiFields: UiField[]
  formStatus: {
    type: 'idle' | 'error' | 'success'
    message: string
  }
  isSubmitting: boolean
  updateField: (field: keyof CreateCalculatorFormState['formData'], value: string) => void
  updateUiField: (index: number, patch: Partial<UiField>) => void
  addUiField: () => void
  removeUiField: (index: number) => void
  resetForm: () => void
  derivedPayload: {
    algorithmMetadata: {
      engine: string
      inputs: string[]
      outputs: string[]
    }
    uiSchema: {
      title: string
      fields: Array<{
        id: string
        label: string
        type: string
        required?: boolean
      }>
      layout: string[][]
    }
  }
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
}

const buildList = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

export const useCreateCalculatorForm = (): CreateCalculatorFormState => {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    algorithmEngine: 'amortization-v1',
    algorithmInputs: 'principal, rate, termYears, extraPayment',
    algorithmOutputs: 'totalInterest, payoffDate, paymentSchedule',
    uiTitle: 'Mortgage Payoff Planner',
  })
  const [uiFields, setUiFields] = useState<UiField[]>([
    { id: 'principal', label: 'Principal', type: 'currency', required: true },
    { id: 'rate', label: 'Interest Rate', type: 'percent', required: true },
    { id: 'termYears', label: 'Term (years)', type: 'number', required: true },
    { id: 'extraPayment', label: 'Extra Payment', type: 'currency', required: false },
  ])
  const [formStatus, setFormStatus] = useState<{
    type: 'idle' | 'error' | 'success'
    message: string
  }>({ type: 'idle', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const updateUiField = (index: number, patch: Partial<UiField>) => {
    setUiFields((prev) => prev.map((field, i) => (i === index ? { ...field, ...patch } : field)))
  }

  const addUiField = () => {
    setUiFields((prev) => [
      ...prev,
      { id: '', label: '', type: 'text', required: false },
    ])
  }

  const removeUiField = (index: number) => {
    setUiFields((prev) => prev.filter((_, i) => i !== index))
  }

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      algorithmEngine: 'amortization-v1',
      algorithmInputs: 'principal, rate, termYears, extraPayment',
      algorithmOutputs: 'totalInterest, payoffDate, paymentSchedule',
      uiTitle: 'Mortgage Payoff Planner',
    })
    setUiFields([
      { id: 'principal', label: 'Principal', type: 'currency', required: true },
      { id: 'rate', label: 'Interest Rate', type: 'percent', required: true },
      { id: 'termYears', label: 'Term (years)', type: 'number', required: true },
      { id: 'extraPayment', label: 'Extra Payment', type: 'currency', required: false },
    ])
    setFormStatus({ type: 'idle', message: '' })
  }

  const derivedPayload = useMemo(() => {
    return {
      algorithmMetadata: {
        engine: formData.algorithmEngine.trim(),
        inputs: buildList(formData.algorithmInputs),
        outputs: buildList(formData.algorithmOutputs),
      },
      uiSchema: {
        title: formData.uiTitle.trim(),
        fields: uiFields.map((field) => ({
          id: field.id.trim(),
          label: field.label.trim(),
          type: field.type,
          required: field.required || undefined,
        })),
        layout: uiFields.map((field) => [field.id.trim()]).filter((item) => item[0]),
      },
    }
  }, [formData.algorithmEngine, formData.algorithmInputs, formData.algorithmOutputs, formData.uiTitle, uiFields])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormStatus({ type: 'idle', message: '' })

    if (!formData.code.trim() || !formData.name.trim()) {
      setFormStatus({ type: 'error', message: 'Code and name are required.' })
      return
    }

    const hasEmptyField = uiFields.some((field) => !field.id.trim() || !field.label.trim())
    if (hasEmptyField) {
      setFormStatus({ type: 'error', message: 'UI fields must include id and label.' })
      return
    }

    const payload: CreateCalculatorRequest = {
      code: formData.code.trim(),
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      algorithmMetadata: derivedPayload.algorithmMetadata,
      uiSchema: derivedPayload.uiSchema,
    }

    try {
      setIsSubmitting(true)
      const api = new CalculatorsApi()
      await api.createCalculator({ createCalculatorRequest: payload })
      setFormStatus({ type: 'success', message: 'Calculator created successfully.' })
      setFormData((prev) => ({
        ...prev,
        code: '',
        name: '',
        description: '',
      }))
    } catch (error) {
      setFormStatus({
        type: 'error',
        message: 'Failed to create calculator. Check the API and request payload.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    formData,
    uiFields,
    formStatus,
    isSubmitting,
    updateField,
    updateUiField,
    addUiField,
    removeUiField,
    resetForm,
    derivedPayload,
    handleSubmit,
  }
}
