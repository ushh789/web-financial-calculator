import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  CalculatorsApi,
  type CalculatorDto,
  type CalculatorVersionDto,
  type FinancialProductDefinitionDto,
  type ProductDefaultsDto,
} from '../generated'
import Modal from './Modal'

type CalculatorDetailsProps = {
  calculatorId: string
  onBack: () => void
  theme: 'light' | 'dark'
}

const formatDate = (value?: Date | string) => {
  if (!value) return '--'
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return '--'
  return date.toLocaleString()
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

const formatOptionalNumber = (value?: number) => (value === undefined ? '' : String(value))

const defaultVersionFormData = {
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
  defaultsCurrency: '',
  defaultsRoundingScale: '',
  defaultsRoundingMode: '',
}

const toVersionFormData = (algorithm?: FinancialProductDefinitionDto) => {
  if (!algorithm) return { ...defaultVersionFormData }
  return {
    algorithmType: algorithm.type ?? defaultVersionFormData.algorithmType,
    interestMethod: algorithm.interest?.method ?? defaultVersionFormData.interestMethod,
    interestDayCountConvention:
      algorithm.interest?.dayCountConvention ?? defaultVersionFormData.interestDayCountConvention,
    interestRateType: algorithm.interest?.rateType ?? defaultVersionFormData.interestRateType,
    interestAccrualFrequency: algorithm.interest?.accrualFrequency ?? '',
    interestCompoundingFrequency: algorithm.interest?.compoundingFrequency ?? '',
    repaymentStrategy: algorithm.repayment?.strategy ?? defaultVersionFormData.repaymentStrategy,
    repaymentFrequency: algorithm.repayment?.frequency ?? defaultVersionFormData.repaymentFrequency,
    constraintsMinAmount: formatOptionalNumber(algorithm.constraints?.minAmount),
    constraintsMaxAmount: formatOptionalNumber(algorithm.constraints?.maxAmount),
    constraintsMinTerm: formatOptionalNumber(algorithm.constraints?.minTerm),
    constraintsMaxTerm: formatOptionalNumber(algorithm.constraints?.maxTerm),
    constraintsMinRate: formatOptionalNumber(algorithm.constraints?.minRate),
    constraintsMaxRate: formatOptionalNumber(algorithm.constraints?.maxRate),
    defaultsFixedRate: formatOptionalNumber(algorithm.defaults?.fixedRate),
    defaultsCurrency: algorithm.defaults?.currency ?? '',
    defaultsRoundingScale: formatOptionalNumber(algorithm.defaults?.roundingScale),
    defaultsRoundingMode: algorithm.defaults?.roundingMode ?? '',
  }
}

const CalculatorDetails = ({ calculatorId, onBack, theme }: CalculatorDetailsProps) => {
  const [calculator, setCalculator] = useState<CalculatorDto | null>(null)
  const [versions, setVersions] = useState<CalculatorVersionDto[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [selectedVersionId, setSelectedVersionId] = useState('')
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false)
  const [versionFormData, setVersionFormData] = useState(defaultVersionFormData)
  const [versionStatus, setVersionStatus] = useState<{ type: 'idle' | 'error' | 'success'; message: string }>({
    type: 'idle',
    message: '',
  })
  const [isVersionSubmitting, setIsVersionSubmitting] = useState(false)

  const loadDetails = useCallback(async () => {
    setStatus('loading')
    setErrorMessage('')
    try {
      const api = new CalculatorsApi()
      const [calculatorResponse, versionResponse] = await Promise.all([
        api.getCalculatorById({ id: calculatorId }),
        api.getCalculatorVersions({ id: calculatorId }),
      ])
      setCalculator(calculatorResponse)
      setVersions(versionResponse ?? [])
      setStatus('ready')
    } catch (error) {
      setStatus('error')
      setErrorMessage('Failed to load calculator details. Check the API and try again.')
    }
  }, [calculatorId])

  useEffect(() => {
    void loadDetails()
  }, [loadDetails])

  const sortedVersions = useMemo(() => {
    return [...versions].sort((a, b) => {
      const aVersion = a.version ?? 0
      const bVersion = b.version ?? 0
      return bVersion - aVersion
    })
  }, [versions])

  const getVersionOptionId = useCallback((version: CalculatorVersionDto, index: number) => {
    return version.id ?? `version-${version.version ?? index}`
  }, [])

  useEffect(() => {
    if (sortedVersions.length === 0) {
      setSelectedVersionId('')
      return
    }
    const defaultId = getVersionOptionId(sortedVersions[0], 0)
    setSelectedVersionId((prev) => {
      const exists = sortedVersions.some((version, index) => getVersionOptionId(version, index) === prev)
      return exists ? prev : defaultId
    })
  }, [sortedVersions, getVersionOptionId])

  const selectedVersion = useMemo(() => {
    if (!selectedVersionId) return undefined
    return sortedVersions.find((version, index) => getVersionOptionId(version, index) === selectedVersionId)
  }, [selectedVersionId, sortedVersions, getVersionOptionId])

  const algorithmMetadata = useMemo<FinancialProductDefinitionDto>(() => {
    const constraints = {
      minAmount: parseOptionalNumber(versionFormData.constraintsMinAmount),
      maxAmount: parseOptionalNumber(versionFormData.constraintsMaxAmount),
      minTerm: parseOptionalNumber(versionFormData.constraintsMinTerm),
      maxTerm: parseOptionalNumber(versionFormData.constraintsMaxTerm),
      minRate: parseOptionalNumber(versionFormData.constraintsMinRate),
      maxRate: parseOptionalNumber(versionFormData.constraintsMaxRate),
    }
    const defaults: ProductDefaultsDto = {
      fixedRate: parseOptionalNumber(versionFormData.defaultsFixedRate),
      currency: parseOptionalString(versionFormData.defaultsCurrency) as ProductDefaultsDto['currency'],
      roundingScale: parseOptionalNumber(versionFormData.defaultsRoundingScale),
      roundingMode: parseOptionalString(versionFormData.defaultsRoundingMode) as ProductDefaultsDto['roundingMode'],
    }
    const hasConstraints = Object.values(constraints).some((value) => value !== undefined)
    const hasDefaults = Object.values(defaults).some((value) => value !== undefined)

    return {
      type: versionFormData.algorithmType as FinancialProductDefinitionDto['type'],
      interest: {
        method: versionFormData.interestMethod as FinancialProductDefinitionDto['interest']['method'],
        dayCountConvention:
          versionFormData.interestDayCountConvention as FinancialProductDefinitionDto['interest']['dayCountConvention'],
        rateType: versionFormData.interestRateType as FinancialProductDefinitionDto['interest']['rateType'],
        accrualFrequency: parseOptionalString(versionFormData.interestAccrualFrequency) as
          | FinancialProductDefinitionDto['interest']['accrualFrequency']
          | undefined,
        compoundingFrequency: parseOptionalString(versionFormData.interestCompoundingFrequency) as
          | FinancialProductDefinitionDto['interest']['compoundingFrequency']
          | undefined,
      },
      repayment: {
        strategy: versionFormData.repaymentStrategy as FinancialProductDefinitionDto['repayment']['strategy'],
        frequency: versionFormData.repaymentFrequency as FinancialProductDefinitionDto['repayment']['frequency'],
      },
      constraints: hasConstraints ? constraints : undefined,
      defaults: hasDefaults ? defaults : undefined,
    }
  }, [versionFormData])

  const openVersionModal = () => {
    const baseAlgorithm = selectedVersion?.algorithmMetadata ?? sortedVersions[0]?.algorithmMetadata
    setVersionFormData(toVersionFormData(baseAlgorithm))
    setVersionStatus({ type: 'idle', message: '' })
    setIsVersionModalOpen(true)
  }

  const closeVersionModal = () => {
    if (isVersionSubmitting) return
    setIsVersionModalOpen(false)
  }

  const updateVersionField = (field: keyof typeof versionFormData, value: string) => {
    setVersionFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCreateVersion = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setVersionStatus({ type: 'idle', message: '' })

    try {
      setIsVersionSubmitting(true)
      const api = new CalculatorsApi()
      await api.addCalculatorVersion({
        id: calculatorId,
        createVersionRequest: {
          algorithmMetadata,
        },
      })
      setVersionStatus({ type: 'success', message: 'Version created successfully.' })
      await loadDetails()
      setIsVersionModalOpen(false)
    } catch (error) {
      setVersionStatus({
        type: 'error',
        message: 'Failed to create version. Check the API and request payload.',
      })
    } finally {
      setIsVersionSubmitting(false)
    }
  }

  return (
    <section className="details">
      <div className="details__header">
        <div>
          <h2>Calculator details</h2>
          <p className="details__subtitle">Review configuration, versions, and launch context.</p>
        </div>
        <div className="actions">
          <button className="btn btn--ghost" type="button" onClick={loadDetails} disabled={status === 'loading'}>
            {status === 'loading' ? 'Refreshing...' : 'Refresh'}
          </button>
          <button className="btn btn--subtle" type="button" onClick={onBack}>
            Back to dashboard
          </button>
        </div>
      </div>

      {status === 'error' && <div className="form-status form-status--error">{errorMessage}</div>}
      {status === 'loading' && (
        <div className="details__grid" aria-hidden="true">
          <div className="panel details__panel details__panel--skeleton">
            <div className="skeleton-line skeleton-line--title" />
            <div className="skeleton-line skeleton-line--meta" />
            <div className="skeleton-line skeleton-line--meta" />
            <div className="skeleton-line skeleton-line--meta" />
          </div>
          <div className="panel details__panel details__panel--skeleton">
            <div className="skeleton-line skeleton-line--title" />
            <div className="skeleton-line skeleton-line--body" />
            <div className="skeleton-line skeleton-line--body" />
          </div>
        </div>
      )}

      {status === 'ready' && calculator && (
        <div className="details__grid">
          <div className="panel details__panel">
            <div className="details__panel-header">
              <h3>Calculator</h3>
              <div className="details__panel-actions">
                <label className="field field--compact">
                  <select
                    className="field__input"
                    value={selectedVersionId}
                    onChange={(event) => setSelectedVersionId(event.target.value)}
                    disabled={sortedVersions.length === 0}
                  >
                    {sortedVersions.length === 0 && <option value="">No versions yet</option>}
                    {sortedVersions.map((version, index) => {
                      const optionId = getVersionOptionId(version, index)
                      return (
                        <option key={optionId} value={optionId}>
                          Version {version.version ?? '--'} · {formatDate(version.createdAt)}
                        </option>
                      )
                    })}
                  </select>
                </label>
                <button className="btn btn--primary" type="button" onClick={openVersionModal}>
                  Add new version
                </button>
              </div>
            </div>
            <div className="details__kv">
              <div className="details__item">
                <span className="details__label">Name</span>
                <span className="details__value">{calculator.name || '--'}</span>
              </div>
              <div className="details__item">
                <span className="details__label">Code</span>
                <span className="details__value details__value--mono">{calculator.code || '--'}</span>
              </div>
              <div className="details__item">
                <span className="details__label">Status</span>
                <span className="details__value">{calculator.active ? 'Active' : 'Inactive'}</span>
              </div>
              <div className="details__item">
                <span className="details__label">Created</span>
                <span className="details__value">{formatDate(calculator.createdAt)}</span>
              </div>
            </div>
            {calculator.description && (
              <p className="details__description">{calculator.description}</p>
            )}
          </div>

          <div className="panel details__panel">
            <div className="details__panel-header">
              <h3>Versions</h3>
              <span className="details__badge">{sortedVersions.length} total</span>
            </div>
            {sortedVersions.length === 0 && (
              <div className="detail__state">No versions yet. Create one from the API.</div>
            )}
            {sortedVersions.length > 0 && (
              <div className="version-list">
                {sortedVersions.map((version, index) => {
                  const algorithm = version.algorithmMetadata
                  const key = version.id ?? `version-${version.version ?? 'unknown'}-${index}`
                  return (
                    <div className="version-card" key={key}>
                      <div className="version-card__header">
                        <div className="version-card__title">
                          Version {version.version ?? '--'}
                        </div>
                        <div className="version-card__date">{formatDate(version.createdAt)}</div>
                      </div>
                      <div className="version-card__meta">
                        <span>Type: {algorithm?.type ?? '--'}</span>
                        <span>Interest: {algorithm?.interest?.method ?? '--'}</span>
                        <span>Rate: {algorithm?.interest?.rateType ?? '--'}</span>
                        <span>Repayment: {algorithm?.repayment?.strategy ?? '--'}</span>
                        <span>Frequency: {algorithm?.repayment?.frequency ?? '--'}</span>
                      </div>
                      {(algorithm?.constraints || algorithm?.defaults) && (
                        <div className="version-card__details">
                          {algorithm?.constraints && (
                            <div>
                              <div className="details__label">Constraints</div>
                              <div className="details__value details__value--mono">
                                {JSON.stringify(algorithm.constraints)}
                              </div>
                            </div>
                          )}
                          {algorithm?.defaults && (
                            <div>
                              <div className="details__label">Defaults</div>
                              <div className="details__value">
                                <div className="details__list">
                                  {algorithm.defaults.fixedRate !== undefined && (
                                    <div className="details__list-item">
                                      <span className="details__list-key">Fixed rate</span>
                                      <span className="details__list-value">{algorithm.defaults.fixedRate}</span>
                                    </div>
                                  )}
                                  {algorithm.defaults.currency && (
                                    <div className="details__list-item">
                                      <span className="details__list-key">Currency</span>
                                      <span className="details__list-value">{algorithm.defaults.currency}</span>
                                    </div>
                                  )}
                                  {algorithm.defaults.roundingScale !== undefined && (
                                    <div className="details__list-item">
                                      <span className="details__list-key">Rounding scale</span>
                                      <span className="details__list-value">{algorithm.defaults.roundingScale}</span>
                                    </div>
                                  )}
                                  {algorithm.defaults.roundingMode && (
                                    <div className="details__list-item">
                                      <span className="details__list-key">Rounding mode</span>
                                      <span className="details__list-value">{algorithm.defaults.roundingMode}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <Modal
        isOpen={isVersionModalOpen}
        onClose={closeVersionModal}
        title="Add new version"
        theme={theme}
        subtitle={`Start from ${
          selectedVersion?.version !== undefined ? `version ${selectedVersion.version}` : 'the default setup'
        }.`}
      >
        <form className="admin__form" onSubmit={handleCreateVersion}>
          <div className="field-group">
            <div className="field-group__header">
              <div>
                <h4>Algorithm metadata</h4>
                <p>Adjust the calculation logic for this new version.</p>
              </div>
            </div>
            <div className="field-group__body">
              <div className="field-group__section">
                <div className="field-group__section-title">Product</div>
                <div className="field-grid">
                  <label className="field">
                    <span className="field__label">Type</span>
                    <select
                      className="field__input"
                      value={versionFormData.algorithmType}
                      onChange={(event) => updateVersionField('algorithmType', event.target.value)}
                    >
                      <option value="LOAN">Loan</option>
                      <option value="DEPOSIT">Deposit</option>
                    </select>
                  </label>
                </div>
              </div>

              <div className="field-group__section">
                <div className="field-group__section-title">Interest</div>
                <div className="field-grid">
                  <label className="field">
                    <span className="field__label">Method</span>
                    <select
                      className="field__input"
                      value={versionFormData.interestMethod}
                      onChange={(event) => updateVersionField('interestMethod', event.target.value)}
                    >
                      <option value="SIMPLE">Simple</option>
                      <option value="COMPOUND">Compound</option>
                    </select>
                  </label>
                  <label className="field">
                    <span className="field__label">Day count</span>
                    <select
                      className="field__input"
                      value={versionFormData.interestDayCountConvention}
                      onChange={(event) => updateVersionField('interestDayCountConvention', event.target.value)}
                    >
                      <option value="ACTUAL_365">Actual/365</option>
                      <option value="ACTUAL_360">Actual/360</option>
                      <option value="THIRTY_360">30/360</option>
                      <option value="ACTUAL_ACTUAL">Actual/Actual</option>
                    </select>
                  </label>
                  <label className="field">
                    <span className="field__label">Rate type</span>
                    <select
                      className="field__input"
                      value={versionFormData.interestRateType}
                      onChange={(event) => updateVersionField('interestRateType', event.target.value)}
                    >
                      <option value="FIXED">Fixed</option>
                      <option value="FLOATING">Floating</option>
                    </select>
                  </label>
                  <label className="field">
                    <span className="field__label">Accrual frequency</span>
                    <select
                      className="field__input"
                      value={versionFormData.interestAccrualFrequency}
                      onChange={(event) => updateVersionField('interestAccrualFrequency', event.target.value)}
                    >
                      <option value="">None</option>
                      <option value="DAILY">Daily</option>
                      <option value="MONTHLY">Monthly</option>
                      <option value="QUARTERLY">Quarterly</option>
                      <option value="ANNUALLY">Annually</option>
                    </select>
                  </label>
                  <label className="field">
                    <span className="field__label">Compounding frequency</span>
                    <select
                      className="field__input"
                      value={versionFormData.interestCompoundingFrequency}
                      onChange={(event) => updateVersionField('interestCompoundingFrequency', event.target.value)}
                    >
                      <option value="">None</option>
                      <option value="DAILY">Daily</option>
                      <option value="MONTHLY">Monthly</option>
                      <option value="QUARTERLY">Quarterly</option>
                      <option value="ANNUALLY">Annually</option>
                    </select>
                  </label>
                </div>
              </div>

              <div className="field-group__section">
                <div className="field-group__section-title">Repayment</div>
                <div className="field-grid">
                  <label className="field">
                    <span className="field__label">Strategy</span>
                    <select
                      className="field__input"
                      value={versionFormData.repaymentStrategy}
                      onChange={(event) => updateVersionField('repaymentStrategy', event.target.value)}
                    >
                      <option value="ANNUITY">Annuity</option>
                      <option value="LINEAR">Linear</option>
                      <option value="ZERO_COUPON">Zero coupon</option>
                    </select>
                  </label>
                  <label className="field">
                    <span className="field__label">Frequency</span>
                    <select
                      className="field__input"
                      value={versionFormData.repaymentFrequency}
                      onChange={(event) => updateVersionField('repaymentFrequency', event.target.value)}
                    >
                      <option value="MONTHLY">Monthly</option>
                      <option value="QUARTERLY">Quarterly</option>
                      <option value="ANNUALLY">Annually</option>
                      <option value="AT_MATURITY">At maturity</option>
                    </select>
                  </label>
                </div>
              </div>

              <div className="field-group__section">
                <div className="field-group__section-title">Constraints</div>
                <div className="field-grid">
                  <label className="field">
                    <span className="field__label">Min amount</span>
                    <input
                      className="field__input"
                      type="number"
                      value={versionFormData.constraintsMinAmount}
                      onChange={(event) => updateVersionField('constraintsMinAmount', event.target.value)}
                    />
                  </label>
                  <label className="field">
                    <span className="field__label">Max amount</span>
                    <input
                      className="field__input"
                      type="number"
                      value={versionFormData.constraintsMaxAmount}
                      onChange={(event) => updateVersionField('constraintsMaxAmount', event.target.value)}
                    />
                  </label>
                  <label className="field">
                    <span className="field__label">Min term</span>
                    <input
                      className="field__input"
                      type="number"
                      value={versionFormData.constraintsMinTerm}
                      onChange={(event) => updateVersionField('constraintsMinTerm', event.target.value)}
                    />
                  </label>
                  <label className="field">
                    <span className="field__label">Max term</span>
                    <input
                      className="field__input"
                      type="number"
                      value={versionFormData.constraintsMaxTerm}
                      onChange={(event) => updateVersionField('constraintsMaxTerm', event.target.value)}
                    />
                  </label>
                  <label className="field">
                    <span className="field__label">Min rate</span>
                    <input
                      className="field__input"
                      type="number"
                      value={versionFormData.constraintsMinRate}
                      onChange={(event) => updateVersionField('constraintsMinRate', event.target.value)}
                    />
                  </label>
                  <label className="field">
                    <span className="field__label">Max rate</span>
                    <input
                      className="field__input"
                      type="number"
                      value={versionFormData.constraintsMaxRate}
                      onChange={(event) => updateVersionField('constraintsMaxRate', event.target.value)}
                    />
                  </label>
                </div>
              </div>

              <div className="field-group__section">
                <div className="field-group__section-title">Defaults</div>
                <div className="field-grid">
                  <label className="field">
                    <span className="field__label">Fixed rate</span>
                    <input
                      className="field__input"
                      type="number"
                      value={versionFormData.defaultsFixedRate}
                      onChange={(event) => updateVersionField('defaultsFixedRate', event.target.value)}
                    />
                  </label>
                  <label className="field">
                    <span className="field__label">Currency</span>
                    <input
                      className="field__input"
                      type="text"
                      value={versionFormData.defaultsCurrency}
                      onChange={(event) => updateVersionField('defaultsCurrency', event.target.value)}
                    />
                  </label>
                  <label className="field">
                    <span className="field__label">Rounding scale</span>
                    <input
                      className="field__input"
                      type="number"
                      value={versionFormData.defaultsRoundingScale}
                      onChange={(event) => updateVersionField('defaultsRoundingScale', event.target.value)}
                    />
                  </label>
                  <label className="field">
                    <span className="field__label">Rounding mode</span>
                    <select
                      className="field__input"
                      value={versionFormData.defaultsRoundingMode}
                      onChange={(event) => updateVersionField('defaultsRoundingMode', event.target.value)}
                    >
                      <option value="">None</option>
                      <option value="UP">Up</option>
                      <option value="DOWN">Down</option>
                      <option value="CEILING">Ceiling</option>
                      <option value="FLOOR">Floor</option>
                      <option value="HALF_UP">Half up</option>
                      <option value="HALF_DOWN">Half down</option>
                      <option value="HALF_EVEN">Half even</option>
                      <option value="UNNECESSARY">Unnecessary</option>
                    </select>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {versionStatus.type !== 'idle' && (
            <div className={`form-status form-status--${versionStatus.type}`}>{versionStatus.message}</div>
          )}

          <div className="actions">
            <button className="btn btn--primary" type="submit" disabled={isVersionSubmitting}>
              {isVersionSubmitting ? 'Creating...' : 'Create version'}
            </button>
            <button className="btn btn--ghost" type="button" onClick={closeVersionModal}>
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </section>
  )
}

export default CalculatorDetails
