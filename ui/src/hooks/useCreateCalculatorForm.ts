import { useMemo, useState, type FormEvent } from 'react'
import { CalculatorsApi, type CreateCalculatorRequest, type FinancialProductDefinitionDto } from '../generated'

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
    algorithmType: string
    interestMethod: string
    interestDayCountConvention: string
    interestRateType: string
    interestAccrualFrequency: string
    interestCompoundingFrequency: string
    repaymentStrategy: string
    repaymentFrequency: string
    constraintsMinAmount: string
    constraintsMaxAmount: string
    constraintsMinTerm: string
    constraintsMaxTerm: string
    constraintsMinRate: string
    constraintsMaxRate: string
    defaultsFixedRate: string
    defaultsDefaultRate: string
    defaultsDefaultTerm: string
    defaultsCurrency: string
    defaultsRoundingScale: string
    defaultsRoundingMode: string
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
  moveUiField: (fromIndex: number, toIndex: number) => void
  addUiField: () => void
  removeUiField: (index: number) => void
  resetForm: () => void
  derivedPayload: {
    algorithmMetadata: FinancialProductDefinitionDto
    uiSchema: {
      title: string
      fields: Array<{
        id: string
        label: string
        type: string
        required?: boolean
        order: number
      }>
    }
  }
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
}

const parseOptionalNumber = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) return undefined
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : undefined
}

const parseOptionalString = (value: string) => {
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

export const useCreateCalculatorForm = (): CreateCalculatorFormState => {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    algorithmType: 'LOAN',
    interestMethod: 'SIMPLE',
    interestDayCountConvention: 'ACTUAL_365',
    interestRateType: 'FIXED',
    interestAccrualFrequency: '',
    interestCompoundingFrequency: '',
    repaymentStrategy: 'ANNUITY',
    repaymentFrequency: 'MONTHLY',
    constraintsMinAmount: '',
    constraintsMaxAmount: '',
    constraintsMinTerm: '',
    constraintsMaxTerm: '',
    constraintsMinRate: '',
    constraintsMaxRate: '',
    defaultsFixedRate: '',
    defaultsDefaultRate: '',
    defaultsDefaultTerm: '',
    defaultsCurrency: '',
    defaultsRoundingScale: '',
    defaultsRoundingMode: '',
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

  const moveUiField = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return
    setUiFields((prev) => {
      if (fromIndex < 0 || toIndex < 0 || fromIndex >= prev.length || toIndex >= prev.length) {
        return prev
      }
      const next = [...prev]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      return next
    })
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
      algorithmType: 'LOAN',
      interestMethod: 'SIMPLE',
      interestDayCountConvention: 'ACTUAL_365',
      interestRateType: 'FIXED',
      interestAccrualFrequency: '',
      interestCompoundingFrequency: '',
      repaymentStrategy: 'ANNUITY',
      repaymentFrequency: 'MONTHLY',
      constraintsMinAmount: '',
      constraintsMaxAmount: '',
      constraintsMinTerm: '',
      constraintsMaxTerm: '',
      constraintsMinRate: '',
      constraintsMaxRate: '',
      defaultsFixedRate: '',
      defaultsDefaultRate: '',
      defaultsDefaultTerm: '',
      defaultsCurrency: '',
      defaultsRoundingScale: '',
      defaultsRoundingMode: '',
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
    const constraints = {
      minAmount: parseOptionalNumber(formData.constraintsMinAmount),
      maxAmount: parseOptionalNumber(formData.constraintsMaxAmount),
      minTerm: parseOptionalNumber(formData.constraintsMinTerm),
      maxTerm: parseOptionalNumber(formData.constraintsMaxTerm),
      minRate: parseOptionalNumber(formData.constraintsMinRate),
      maxRate: parseOptionalNumber(formData.constraintsMaxRate),
    }
    const defaults = {
      fixedRate: parseOptionalNumber(formData.defaultsFixedRate),
      defaultRate: parseOptionalNumber(formData.defaultsDefaultRate),
      defaultTerm: parseOptionalNumber(formData.defaultsDefaultTerm),
      currency: parseOptionalString(formData.defaultsCurrency),
      roundingScale: parseOptionalNumber(formData.defaultsRoundingScale),
      roundingMode: parseOptionalString(formData.defaultsRoundingMode),
    }
    const hasConstraints = Object.values(constraints).some((value) => value !== undefined)
    const hasDefaults = Object.values(defaults).some((value) => value !== undefined)

    return {
      algorithmMetadata: {
        type: formData.algorithmType as FinancialProductDefinitionDto['type'],
        interest: {
          method: formData.interestMethod as FinancialProductDefinitionDto['interest']['method'],
          dayCountConvention:
            formData.interestDayCountConvention as FinancialProductDefinitionDto['interest']['dayCountConvention'],
          rateType: formData.interestRateType as FinancialProductDefinitionDto['interest']['rateType'],
          accrualFrequency: parseOptionalString(formData.interestAccrualFrequency) as
            | FinancialProductDefinitionDto['interest']['accrualFrequency']
            | undefined,
          compoundingFrequency: parseOptionalString(formData.interestCompoundingFrequency) as
            | FinancialProductDefinitionDto['interest']['compoundingFrequency']
            | undefined,
        },
        repayment: {
          strategy: formData.repaymentStrategy as FinancialProductDefinitionDto['repayment']['strategy'],
          frequency: formData.repaymentFrequency as FinancialProductDefinitionDto['repayment']['frequency'],
        },
        constraints: hasConstraints ? constraints : undefined,
        defaults: hasDefaults
          ? {
              fixedRate: defaults.fixedRate,
              defaultRate: defaults.defaultRate,
              defaultTerm: defaults.defaultTerm,
              currency: defaults.currency,
              roundingScale: defaults.roundingScale,
              roundingMode: defaults.roundingMode,
            }
          : undefined,
      },
      uiSchema: {
        title: formData.uiTitle.trim(),
        fields: uiFields.map((field, index) => ({
          id: field.id.trim(),
          label: field.label.trim(),
          type: field.type,
          required: field.required || undefined,
          order: index + 1,
        })),
      },
    }
  }, [
    formData.algorithmType,
    formData.interestMethod,
    formData.interestDayCountConvention,
    formData.interestRateType,
    formData.interestAccrualFrequency,
    formData.interestCompoundingFrequency,
    formData.repaymentStrategy,
    formData.repaymentFrequency,
    formData.constraintsMinAmount,
    formData.constraintsMaxAmount,
    formData.constraintsMinTerm,
    formData.constraintsMaxTerm,
    formData.constraintsMinRate,
    formData.constraintsMaxRate,
    formData.defaultsFixedRate,
    formData.defaultsDefaultRate,
    formData.defaultsDefaultTerm,
    formData.defaultsCurrency,
    formData.defaultsRoundingScale,
    formData.defaultsRoundingMode,
    formData.uiTitle,
    uiFields,
  ])

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
    moveUiField,
    addUiField,
    removeUiField,
    resetForm,
    derivedPayload,
    handleSubmit,
  }
}
