import { RoutedAppShell } from "@/components/arena/RoutedAppShell";
import type { PackageReviewRenderState } from "@/data/sampleCases";
import type { ArenaStage } from "@/lib/arenaReviewState";
import type { CasePackageValidationError } from "@/lib/casePackageValidation";
import type { LandscapeContextNode } from "@/lib/types";

type PackageReviewGateProps = {
  renderState: PackageReviewRenderState;
  landscapeContextNodes?: LandscapeContextNode[];
  initialStage: ArenaStage;
};

const maxValidationErrorsShown = 12;

export function PackageReviewGate({
  renderState,
  landscapeContextNodes = [],
  initialStage,
}: PackageReviewGateProps) {
  if (!renderState.ok) {
    return <InvalidPackageState errors={renderState.errors} />;
  }

  return (
    <RoutedAppShell
      cases={renderState.cases}
      landscapeContextNodes={landscapeContextNodes}
      initialStage={initialStage}
    />
  );
}

function InvalidPackageState({
  errors,
}: {
  errors: CasePackageValidationError[];
}) {
  const visibleErrors = errors.slice(0, maxValidationErrorsShown);
  const remainingErrorCount = Math.max(0, errors.length - visibleErrors.length);

  return (
    <main className="arena-empty arena-invalid-package">
      <section aria-labelledby="invalid-package-title">
        <p className="eyebrow">Telemetry Court</p>
        <h1 id="invalid-package-title">Invalid CasePackage</h1>
        <p>
          This package failed validation and cannot be reviewed. Fix the
          package contract, provenance, sanitization, or references before
          opening a normal review.
        </p>

        <div className="invalid-package-error-list" role="list">
          {visibleErrors.map((error, index) => (
            <article
              className="invalid-package-error"
              key={`${error.path}-${error.code}-${index}`}
              role="listitem"
            >
              <dl>
                <div>
                  <dt>Path</dt>
                  <dd>
                    <code>{error.path}</code>
                  </dd>
                </div>
                <div>
                  <dt>Code</dt>
                  <dd>
                    <code>{error.code}</code>
                  </dd>
                </div>
                <div>
                  <dt>Message</dt>
                  <dd>{sanitizeValidationMessage(error.message)}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>

        {remainingErrorCount > 0 ? (
          <p className="invalid-package-overflow">
            {remainingErrorCount} additional validation errors are hidden from
            this UI. Run the package validator in the source environment for the
            complete diagnostic list.
          </p>
        ) : null}
      </section>
    </main>
  );
}

function sanitizeValidationMessage(message: string): string {
  const redacted = message.replace(/"[^"]*"/g, '"[redacted]"');

  if (redacted.length <= 180) {
    return redacted;
  }

  return `${redacted.slice(0, 177).trimEnd()}...`;
}
