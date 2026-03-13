import { useMemo, useState, type FormEvent } from 'react'
import {
  CalculatorsApi,
  type CreateCalculatorRequest,
  type FinancialProductDefinitionDto,
  type ProductDefaultsDto,
} from '../generated'

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
  }
  formStatus: {
    type: 'idle' | 'error' | 'success'
    message: string
  }
  isSubmitting: boolean
  updateField: (field: keyof CreateCalculatorFormState['formData'], value: string) => void
  resetForm: () => void
  algorithmMetadata: FinancialProductDefinitionDto
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
  })
  const [formStatus, setFormStatus] = useState<{
    type: 'idle' | 'error' | 'success'
    message: string
  }>({ type: 'idle', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
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
    })
    setFormStatus({ type: 'idle', message: '' })
  }

  const algorithmMetadata = useMemo<FinancialProductDefinitionDto>(() => {
    const constraints = {
      minAmount: parseOptionalNumber(formData.constraintsMinAmount),
      maxAmount: parseOptionalNumber(formData.constraintsMaxAmount),
      minTerm: parseOptionalNumber(formData.constraintsMinTerm),
      maxTerm: parseOptionalNumber(formData.constraintsMaxTerm),
      minRate: parseOptionalNumber(formData.constraintsMinRate),
      maxRate: parseOptionalNumber(formData.constraintsMaxRate),
    }
    const defaults: ProductDefaultsDto = {
      fixedRate: parseOptionalNumber(formData.defaultsFixedRate),
      currency: parseOptionalString(formData.defaultsCurrency) as ProductDefaultsDto['currency'],
      roundingScale: parseOptionalNumber(formData.defaultsRoundingScale),
      roundingMode: parseOptionalString(formData.defaultsRoundingMode) as ProductDefaultsDto['roundingMode'],
    }
    const hasConstraints = Object.values(constraints).some((value) => value !== undefined)
    const hasDefaults = Object.values(defaults).some((value) => value !== undefined)

    return {
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
      defaults: hasDefaults ? defaults : undefined,
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
  ])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormStatus({ type: 'idle', message: '' })

    if (!formData.code.trim() || !formData.name.trim()) {
      setFormStatus({ type: 'error', message: 'Code and name are required.' })
      return
    }

    const payload: CreateCalculatorRequest = {
      code: formData.code.trim(),
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      algorithmMetadata,
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
    formStatus,
    isSubmitting,
    updateField,
    resetForm,
    algorithmMetadata,
    handleSubmit,
  }
}
