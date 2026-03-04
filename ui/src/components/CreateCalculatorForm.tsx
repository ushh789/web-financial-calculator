import { useMemo, useState } from 'react'
import binIcon from '../assets/svg/bin.svg'
import { useCreateCalculatorForm } from '../hooks/useCreateCalculatorForm'

type CreateCalculatorFormProps = {
  onBack: () => void
}

const fieldTypeOptions = ['currency', 'number', 'percent', 'text', 'select']

const highlightJson = (value: string) => {
  const escaped = value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return escaped.replace(
    /("(?:\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(?:\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      if (match.startsWith('"')) {
        const isKey = match.endsWith(':')
        return `<span class="json-${isKey ? 'key' : 'string'}">${match}</span>`
      }
      if (match === 'true' || match === 'false') {
        return `<span class="json-boolean">${match}</span>`
      }
      if (match === 'null') {
        return `<span class="json-null">${match}</span>`
      }
      return `<span class="json-number">${match}</span>`
    },
  )
}

const CreateCalculatorForm = ({ onBack }: CreateCalculatorFormProps) => {
  const {
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
  } = useCreateCalculatorForm()
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [showPayloadPreview, setShowPayloadPreview] = useState(true)

  const jsonPreview = useMemo(
    () =>
      JSON.stringify(
        {
          code: formData.code.trim(),
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          ...derivedPayload,
        },
        null,
        2,
      ),
    [formData.code, formData.description, formData.name, derivedPayload],
  )

  const highlightedPreview = useMemo(() => highlightJson(jsonPreview), [jsonPreview])

  return (
    <div className="panel admin__section">
      <div className="admin__header">
        <h3>Create calculator</h3>
        <button className="btn btn--subtle" type="button" onClick={onBack}>
          Back to dashboard
        </button>
      </div>
      <form className="admin__form" onSubmit={handleSubmit}>
        <label className="field">
          <span className="field__label">Calculator code</span>
          <input
            className="field__input"
            type="text"
            placeholder="e.g. mortgage_payoff"
            value={formData.code}
            onChange={(event) => updateField('code', event.target.value)}
            required
          />
          <span className="field__hint">Letters, numbers, underscores, and dashes only.</span>
        </label>
        <label className="field">
          <span className="field__label">Calculator name</span>
          <input
            className="field__input"
            type="text"
            placeholder="e.g. Mortgage payoff"
            value={formData.name}
            onChange={(event) => updateField('name', event.target.value)}
            required
          />
        </label>
        <label className="field field--wide">
          <span className="field__label">Description</span>
          <textarea
            className="field__input field__input--area"
            placeholder="Explain what this calculator does and who it helps."
            rows={4}
            value={formData.description}
            onChange={(event) => updateField('description', event.target.value)}
          />
        </label>

        <div className="field-group">
          <div className="field-group__header">
            <div>
              <h4>Algorithm metadata</h4>
              <p>Tell the engine what inputs and outputs this calculator uses.</p>
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
                    value={formData.algorithmType}
                    onChange={(event) => updateField('algorithmType', event.target.value)}
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
                    value={formData.interestMethod}
                    onChange={(event) => updateField('interestMethod', event.target.value)}
                  >
                    <option value="SIMPLE">Simple</option>
                    <option value="COMPOUND">Compound</option>
                  </select>
                </label>
                <label className="field">
                  <span className="field__label">Day count</span>
                  <select
                    className="field__input"
                    value={formData.interestDayCountConvention}
                    onChange={(event) => updateField('interestDayCountConvention', event.target.value)}
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
                    value={formData.interestRateType}
                    onChange={(event) => updateField('interestRateType', event.target.value)}
                  >
                    <option value="FIXED">Fixed</option>
                    <option value="FLOATING">Floating</option>
                  </select>
                </label>
                <label className="field">
                  <span className="field__label">Accrual frequency</span>
                  <select
                    className="field__input"
                    value={formData.interestAccrualFrequency}
                    onChange={(event) => updateField('interestAccrualFrequency', event.target.value)}
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
                    value={formData.interestCompoundingFrequency}
                    onChange={(event) => updateField('interestCompoundingFrequency', event.target.value)}
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
                    value={formData.repaymentStrategy}
                    onChange={(event) => updateField('repaymentStrategy', event.target.value)}
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
                    value={formData.repaymentFrequency}
                    onChange={(event) => updateField('repaymentFrequency', event.target.value)}
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
                    value={formData.constraintsMinAmount}
                    onChange={(event) => updateField('constraintsMinAmount', event.target.value)}
                  />
                </label>
                <label className="field">
                  <span className="field__label">Max amount</span>
                  <input
                    className="field__input"
                    type="number"
                    value={formData.constraintsMaxAmount}
                    onChange={(event) => updateField('constraintsMaxAmount', event.target.value)}
                  />
                </label>
                <label className="field">
                  <span className="field__label">Min term</span>
                  <input
                    className="field__input"
                    type="number"
                    value={formData.constraintsMinTerm}
                    onChange={(event) => updateField('constraintsMinTerm', event.target.value)}
                  />
                </label>
                <label className="field">
                  <span className="field__label">Max term</span>
                  <input
                    className="field__input"
                    type="number"
                    value={formData.constraintsMaxTerm}
                    onChange={(event) => updateField('constraintsMaxTerm', event.target.value)}
                  />
                </label>
                <label className="field">
                  <span className="field__label">Min rate</span>
                  <input
                    className="field__input"
                    type="number"
                    value={formData.constraintsMinRate}
                    onChange={(event) => updateField('constraintsMinRate', event.target.value)}
                  />
                </label>
                <label className="field">
                  <span className="field__label">Max rate</span>
                  <input
                    className="field__input"
                    type="number"
                    value={formData.constraintsMaxRate}
                    onChange={(event) => updateField('constraintsMaxRate', event.target.value)}
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
                    value={formData.defaultsFixedRate}
                    onChange={(event) => updateField('defaultsFixedRate', event.target.value)}
                  />
                </label>
                <label className="field">
                  <span className="field__label">Default rate</span>
                  <input
                    className="field__input"
                    type="number"
                    value={formData.defaultsDefaultRate}
                    onChange={(event) => updateField('defaultsDefaultRate', event.target.value)}
                  />
                </label>
                <label className="field">
                  <span className="field__label">Default term</span>
                  <input
                    className="field__input"
                    type="number"
                    value={formData.defaultsDefaultTerm}
                    onChange={(event) => updateField('defaultsDefaultTerm', event.target.value)}
                  />
                </label>
                <label className="field">
                  <span className="field__label">Currency</span>
                  <input
                    className="field__input"
                    type="text"
                    value={formData.defaultsCurrency}
                    onChange={(event) => updateField('defaultsCurrency', event.target.value)}
                  />
                </label>
                <label className="field">
                  <span className="field__label">Rounding scale</span>
                  <input
                    className="field__input"
                    type="number"
                    value={formData.defaultsRoundingScale}
                    onChange={(event) => updateField('defaultsRoundingScale', event.target.value)}
                  />
                </label>
                <label className="field">
                  <span className="field__label">Rounding mode</span>
                  <select
                    className="field__input"
                    value={formData.defaultsRoundingMode}
                    onChange={(event) => updateField('defaultsRoundingMode', event.target.value)}
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

        <div className="field-group">
          <div className="field-group__header">
            <div>
              <h4>UI schema</h4>
              <p>Define how fields appear in the calculator UI.</p>
            </div>
          </div>
          <div className="field-group__body">
            <label className="field field--wide">
              <span className="field__label">Title</span>
              <input
                className="field__input"
                type="text"
                value={formData.uiTitle}
                onChange={(event) => updateField('uiTitle', event.target.value)}
                required
              />
            </label>
            <div className="ui-fields">
              {uiFields.map((field, index) => (
                <div
                  className={`ui-field${draggingIndex === index ? ' ui-field--dragging' : ''}${
                    dragOverIndex === index ? ' ui-field--over' : ''
                  }`}
                  key={`${field.id}-${index}`}
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.setData('text/plain', String(index))
                    event.dataTransfer.effectAllowed = 'move'
                    setDraggingIndex(index)
                  }}
                  onDragOver={(event) => {
                    event.preventDefault()
                    event.dataTransfer.dropEffect = 'move'
                  }}
                  onDragEnter={(event) => {
                    event.preventDefault()
                    if (draggingIndex !== index) {
                      setDragOverIndex(index)
                    }
                  }}
                  onDrop={(event) => {
                    event.preventDefault()
                    const fromIndex = Number(event.dataTransfer.getData('text/plain'))
                    if (!Number.isNaN(fromIndex)) {
                      moveUiField(fromIndex, index)
                    }
                    setDragOverIndex(null)
                    setDraggingIndex(null)
                  }}
                  onDragEnd={() => {
                    setDragOverIndex(null)
                    setDraggingIndex(null)
                  }}
                >
                  <div className="ui-field__drag">
                    <span className="ui-field__handle" aria-hidden="true">
                      ⋮⋮
                    </span>
                  </div>
                  <label className="field">
                    <span className="field__label">Field id</span>
                    <input
                      className="field__input"
                      type="text"
                      value={field.id}
                      onChange={(event) => updateUiField(index, { id: event.target.value })}
                      required
                    />
                  </label>
                  <label className="field">
                    <span className="field__label">Label</span>
                    <input
                      className="field__input"
                      type="text"
                      value={field.label}
                      onChange={(event) => updateUiField(index, { label: event.target.value })}
                      required
                    />
                  </label>
                  <label className="field">
                    <span className="field__label">Type</span>
                    <select
                      className="field__input"
                      value={field.type}
                      onChange={(event) => updateUiField(index, { type: event.target.value })}
                    >
                      {fieldTypeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="field field--toggle">
                    <span className="field__label">Required</span>
                    <input
                      className="field__checkbox"
                      type="checkbox"
                      checked={field.required}
                      onChange={(event) => updateUiField(index, { required: event.target.checked })}
                    />
                  </label>
                  <button className="icon-button ui-field__delete" type="button" onClick={() => removeUiField(index)}>
                    <img className="icon-button__img" src={binIcon} alt="Remove field" />
                  </button>
                </div>
              ))}
              <button className="ui-field ui-field--adder" type="button" onClick={addUiField}>
                <span className="ui-field__adder-icon">+</span>
                <span className="ui-field__adder-label">Add field</span>
              </button>
            </div>
          </div>
        </div>

        <div className="field-group">
          <div className="field-group__header">
            <div>
              <h4>Payload preview</h4>
              <p>We will send this JSON to `/calculators`.</p>
            </div>
            <button
              className="btn btn--ghost"
              type="button"
              onClick={() => setShowPayloadPreview((prev) => !prev)}
            >
              {showPayloadPreview ? 'Hide preview' : 'Show preview'}
            </button>
          </div>
          {showPayloadPreview && (
            <pre className="json-preview">
              <code dangerouslySetInnerHTML={{ __html: highlightedPreview }} />
            </pre>
          )}
        </div>

        {formStatus.type !== 'idle' && (
          <div className={`form-status form-status--${formStatus.type}`}>{formStatus.message}</div>
        )}
        <div className="actions">
          <button className="btn btn--primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create calculator'}
          </button>
          <button className="btn btn--ghost" type="button" onClick={resetForm}>
            Reset form
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateCalculatorForm
