      {/* PRINT-SUMMARY – samme rekkefølge som i UI, men uten bokser/dropdown */}
      {result && (
        <div className="calc-print-summary">
          <p className="calc-print-line">
            <strong>Løs for:</strong> {makeSolveLabel(formula, result.solveFor)}
          </p>

          {result.variantExpression && (
            <p className="calc-print-line">
              <strong>Bruker:</strong>{" "}
              <MathText text={result.variantExpression} />
            </p>
          )}

          <p className="calc-print-line">
            <strong>Verdier brukt:</strong>
          </p>

          {/* Grid / "tabell" med felter, lik layouten med inputbokser */}
          <div className="calc-print-values-grid">
            {formula.variables.map((v) => {
              if (v.id === result.solveFor) return null;
              const val = result.inputs[v.id];
              if (!val) return null;
              return (
                <div key={v.id} className="calc-print-value-field">
                  <div className="calc-print-label">
                    {v.symbol} ({v.name})
                    {v.unit ? ` [${v.unit}]` : ""}:
                  </div>
                  <div className="calc-print-value">
                    {val}
                    {v.unit ? ` ${v.unit}` : ""}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="calc-print-result-box">
            <div>
              <strong>Resultat: </strong>
              {result.label} = {result.pretty}
            </div>
            <div className="calc-print-raw">Rå verdi: {result.raw}</div>
          </div>
        </div>
      )}
