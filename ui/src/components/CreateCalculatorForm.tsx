import { useCreateCalculatorForm } from '../hooks/useCreateCalculatorForm'

type CreateCalculatorFormProps = {
  onBack: () => void
}

const fieldTypeOptions = ['currency', 'number', 'percent', 'text', 'select']

const CreateCalculatorForm = ({ onBack }: CreateCalculatorFormProps) => {
  const {
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
  } = useCreateCalculatorForm()

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
            <label className="field">
              <span className="field__label">Engine</span>
              <input
                className="field__input"
                type="text"
                value={formData.algorithmEngine}
                onChange={(event) => updateField('algorithmEngine', event.target.value)}
                required
              />
            </label>
            <label className="field">
              <span className="field__label">Inputs (comma separated)</span>
              <input
                className="field__input"
                type="text"
                value={formData.algorithmInputs}
                onChange={(event) => updateField('algorithmInputs', event.target.value)}
                required
              />
            </label>
            <label className="field">
              <span className="field__label">Outputs (comma separated)</span>
              <input
                className="field__input"
                type="text"
                value={formData.algorithmOutputs}
                onChange={(event) => updateField('algorithmOutputs', event.target.value)}
                required
              />
            </label>
          </div>
        </div>

        <div className="field-group">
          <div className="field-group__header">
            <div>
              <h4>UI schema</h4>
              <p>Define how fields appear in the calculator UI.</p>
            </div>
            <button className="btn btn--ghost" type="button" onClick={addUiField}>
              Add field
            </button>
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
                <div className="ui-field" key={`${field.id}-${index}`}>
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
                  <button className="btn btn--subtle" type="button" onClick={() => removeUiField(index)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="field-group">
          <div className="field-group__header">
            <div>
              <h4>Payload preview</h4>
              <p>We will send this JSON to `/calculators`.</p>
            </div>
          </div>
          <pre className="json-preview">
            {JSON.stringify(
              {
                code: formData.code.trim(),
                name: formData.name.trim(),
                description: formData.description.trim() || undefined,
                ...derivedPayload,
              },
              null,
              2,
            )}
          </pre>
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
