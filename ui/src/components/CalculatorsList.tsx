import {useCallback, useEffect, useMemo, useState} from 'react'
import {CalculatorsApi, type CalculatorDto} from '../generated'

type CalculatorsListProps = {
    onSelectCalculator: (id: string) => void
    onCreateCalculator: () => void
}

type Status = 'idle' | 'loading' | 'error'

const formatDate = (value?: Date | string) => {
    if (!value) return '--'
    const date = typeof value === 'string' ? new Date(value) : value
    if (Number.isNaN(date.getTime())) return '--'
    return date.toLocaleString()
}

const matchesQuery = (calculator: CalculatorDto, query: string) => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return true
    const fields = [calculator.name, calculator.code, calculator.description]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
    return fields.includes(normalized)
}

const CalculatorsList = ({onSelectCalculator, onCreateCalculator}: CalculatorsListProps) => {
    const [calculators, setCalculators] = useState<CalculatorDto[]>([])
    const [status, setStatus] = useState<Status>('idle')
    const [errorMessage, setErrorMessage] = useState('')
    const [page, setPage] = useState(0)
    const [size, setSize] = useState(12)
    const [totalPages, setTotalPages] = useState(1)
    const [totalElements, setTotalElements] = useState(0)
    const [searchQuery, setSearchQuery] = useState('')

    const loadCalculators = useCallback(async () => {
        setStatus('loading')
        setErrorMessage('')
        try {
            const api = new CalculatorsApi()
            const response = await api.getAllCalculators({page, size})
            setCalculators(response.content ?? [])
            setTotalPages(Math.max(response.totalPages ?? 1, 1))
            setTotalElements(response.totalElements ?? response.content?.length ?? 0)
            setStatus('idle')
        } catch (error) {
            setStatus('error')
            setErrorMessage('Failed to load calculators. Check the API and try again.')
        }
    }, [page, size])

    useEffect(() => {
        void loadCalculators()
    }, [loadCalculators])

    useEffect(() => {
        setPage((prev) => (prev === 0 ? prev : 0))
    }, [searchQuery])

    const filteredCalculators = useMemo(() => {
        return calculators.filter((calculator) => matchesQuery(calculator, searchQuery))
    }, [calculators, searchQuery])

    const sortedCalculators = useMemo(() => {
        return [...filteredCalculators].sort((a, b) => {
            const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0
            const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0
            return bDate - aDate
        })
    }, [filteredCalculators])

    const resolvedTotalPages = Math.max(totalPages, 1)
    const pageLabel = `Page ${page + 1} of ${resolvedTotalPages}`
    const canGoBack = page > 0 && status !== 'loading'
    const canGoForward = page + 1 < resolvedTotalPages && status !== 'loading'

    const skeletonCount = Math.min(size, 8)

    return (
        <div className="panel admin__section">
            <div className="admin__header">
                <div>
                    <h3>Calculators</h3>
                    <p className="admin__subtitle">Browse and open a calculator to manage its versions.</p>
                </div>
                <div className="admin__header-buttons">
                    <button className="btn btn--ghost" type="button" onClick={loadCalculators}
                            disabled={status === 'loading'}>
                        {status === 'loading' ? 'Refreshing...' : 'Refresh'}
                    </button>
                    <button className="btn btn--ghost" type="button" onClick={onCreateCalculator}>
                        Create new calculator
                    </button>
                </div>
            </div>

            <div className="calculators__toolbar">
                <label className="field calculators__search">
                    <span className="field__label">Search (current page)</span>
                    <input
                        className="field__input"
                        type="search"
                        placeholder="Search by name, code, description"
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                    />
                </label>
                <label className="field calculators__size">
                    <span className="field__label">Page size</span>
                    <select
                        className="field__input"
                        value={size}
                        onChange={(event) => {
                            setSize(Number(event.target.value))
                            setPage(0)
                        }}
                    >
                        <option value={8}>8</option>
                        <option value={12}>12</option>
                        <option value={20}>20</option>
                        <option value={40}>40</option>
                    </select>
                </label>
            </div>

            {status === 'error' && <div className="form-status form-status--error">{errorMessage}</div>}
            {status === 'loading' && (
                <div className="calculators__grid calculators__grid--skeleton" aria-hidden="true">
                    {Array.from({length: skeletonCount}).map((_, index) => (
                        <div className="calculator-card skeleton-card" key={`skeleton-${index}`}>
                            <div className="skeleton-line skeleton-line--title"/>
                            <div className="skeleton-line skeleton-line--meta"/>
                            <div className="skeleton-line skeleton-line--body"/>
                            <div className="skeleton-line skeleton-line--footer"/>
                        </div>
                    ))}
                </div>
            )}
            {status !== 'loading' && sortedCalculators.length === 0 && (
                <div className="detail__state">No calculators match this page. Try another page or clear search.</div>
            )}
            {sortedCalculators.length > 0 && (
                <div className="calculators__grid">
                    {sortedCalculators.map((calculator, index) => {
                        const id = calculator.id ?? ''
                        const key = id || calculator.code || calculator.name || `calculator-${index}`
                        return (
                            <button
                                key={key}
                                className="calculator-card"
                                type="button"
                                onClick={() => id && onSelectCalculator(id)}
                                disabled={!id}
                            >
                                <div className="calculator-card__title">{calculator.name || 'Untitled calculator'}</div>
                                <div className="calculator-card__code">{calculator.code || 'No code'}</div>
                                {calculator.description &&
                                    <p className="calculator-card__description">{calculator.description}</p>}
                                <div className="calculator-card__meta">
                                    <span>{calculator.active ? 'Active' : 'Inactive'}</span>
                                    <span>Created {formatDate(calculator.createdAt)}</span>
                                </div>
                            </button>
                        )
                    })}
                </div>
            )}

            <div className="pagination">
                <div className="calculators__meta">
                    <div className="calculators__page">{pageLabel}</div>
                    <div className="calculators__count">{totalElements} total</div>
                </div>
                <div className="pagination__buttons">
                    <button className="btn btn--ghost" type="button" onClick={() => setPage(0)} disabled={!canGoBack}>
                        {'<<'}
                    </button>
                    <button className="btn btn--ghost" type="button" onClick={() => setPage((prev) => prev - 1)}
                            disabled={!canGoBack}>
                        {'<'}
                    </button>
                    <button className="btn btn--ghost" type="button" onClick={() => setPage((prev) => prev + 1)}
                            disabled={!canGoForward}>
                        {'>'}
                    </button>
                    <button
                        className="btn btn--ghost"
                        type="button"
                        onClick={() => setPage(resolvedTotalPages - 1)}
                        disabled={!canGoForward}
                    >
                        {'>>'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CalculatorsList
