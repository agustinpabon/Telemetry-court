"use client";

import { useState } from "react";

import {
  buildMockAiAssistanceRequestV01,
  resolveMockAiAssistanceQuestionV01,
  type MockAiAssistanceResolutionV01,
} from "@/lib/aiAssistanceMockResolverV01";
import {
  AI_ASSISTANCE_QUESTION_SET_V01,
  AI_ASSISTANCE_UNAVAILABLE_REASONS_V01,
  getAiAssistanceQuestionDefinitionV01,
} from "@/lib/aiAssistanceQuestionSetV01";
import type { CasePackageV01 } from "@/lib/types";

type AssistanceReferenceSelection = {
  claimId: string;
  evidenceId: string;
  labelId: string;
  targetQuestionId: string;
  unavailableReason: string;
};

type EvidenceAssistancePanelProps = {
  casePackage?: CasePackageV01;
  onFocusEvidence?: (evidenceId: string) => void;
};

type EvidenceAssistanceResultProps = {
  resolution?: MockAiAssistanceResolutionV01;
  onFocusEvidence?: (evidenceId: string) => void;
};

const emptyReferenceSelection: AssistanceReferenceSelection = {
  claimId: "",
  evidenceId: "",
  labelId: "",
  targetQuestionId: "",
  unavailableReason: "",
};

const initialQuestionId = AI_ASSISTANCE_QUESTION_SET_V01[0].question_id;

export function EvidenceAssistancePanel({
  casePackage,
  onFocusEvidence,
}: EvidenceAssistancePanelProps) {
  const [questionId, setQuestionId] = useState<string>(initialQuestionId);
  const [references, setReferences] = useState<AssistanceReferenceSelection>({
    ...emptyReferenceSelection,
  });
  const [resolution, setResolution] =
    useState<MockAiAssistanceResolutionV01>();
  const question = getAiAssistanceQuestionDefinitionV01(questionId);
  const requiredReferences = question?.required_references ?? [];
  const optionalReferences = question?.optional_references ?? [];

  function selectQuestion(nextQuestionId: string) {
    setQuestionId(nextQuestionId);
    setReferences({ ...emptyReferenceSelection });
    setResolution(undefined);
  }

  function selectReference(
    key: keyof AssistanceReferenceSelection,
    value: string,
  ) {
    setReferences((current) => ({ ...current, [key]: value }));
    setResolution(undefined);
  }

  function runMockAssistance() {
    const request = buildMockAiAssistanceRequestV01(
      questionId,
      buildGuardrailReferences(references),
    );

    setResolution(
      resolveMockAiAssistanceQuestionV01(request, { casePackage }),
    );
  }

  return (
    <section
      className="evidence-assistance-panel"
      aria-labelledby="evidence-assistance-title"
    >
      <details>
        <summary className="evidence-assistance-heading">
          <span>
            <span className="evidence-assistance-kicker">
              Optional review aid
            </span>
            <strong id="evidence-assistance-title">
              Deterministic mocked evidence assistance
            </strong>
          </span>
          <span className="evidence-assistance-secondary-label">
            Secondary aid · Human ratings stay unchanged
          </span>
        </summary>

        <div className="evidence-assistance-body">
          <p className="evidence-assistance-boundary">
            Fixed questions only. Answers restate validated package mappings and
            never select a rating or verdict.
          </p>

          <div className="evidence-assistance-controls">
            <label>
              <span>Fixed question</span>
              <select
                value={questionId}
                onChange={(event) => selectQuestion(event.target.value)}
              >
                {AI_ASSISTANCE_QUESTION_SET_V01.map((item) => (
                  <option key={item.question_id} value={item.question_id}>
                    {item.text}
                  </option>
                ))}
              </select>
            </label>

            {requiredReferences.includes("claim_id") ? (
              <ReferenceSelect
                label="Claim reference"
                value={references.claimId}
                emptyLabel="Select a package claim"
                options={
                  casePackage?.claims.map((claim) => ({
                    id: claim.claim_id,
                    label: claim.text,
                  })) ?? []
                }
                onChange={(value) => selectReference("claimId", value)}
              />
            ) : null}

            {requiredReferences.includes("evidence_id") ||
            optionalReferences.includes("evidence_id") ? (
              <ReferenceSelect
                label={
                  requiredReferences.includes("evidence_id")
                    ? "Evidence reference"
                    : "Evidence filter (optional)"
                }
                value={references.evidenceId}
                emptyLabel={
                  requiredReferences.includes("evidence_id")
                    ? "Select package evidence"
                    : "Use all package boundary signals"
                }
                options={
                  casePackage?.evidence_items.map((evidence) => ({
                    id: evidence.evidence_id,
                    label: evidence.title,
                  })) ?? []
                }
                onChange={(value) => selectReference("evidenceId", value)}
              />
            ) : null}

            {requiredReferences.includes("label_id") ||
            optionalReferences.includes("label_id") ? (
              <ReferenceSelect
                label={
                  requiredReferences.includes("label_id")
                    ? "Label reference"
                    : "Label filter (optional)"
                }
                value={references.labelId}
                emptyLabel={
                  requiredReferences.includes("label_id")
                    ? "Select a package label"
                    : "No label filter"
                }
                options={
                  casePackage?.candidate_labels.map((label) => ({
                    id: label.label_id,
                    label: label.label,
                  })) ?? []
                }
                onChange={(value) => selectReference("labelId", value)}
              />
            ) : null}

            {optionalReferences.includes("claim_id") ? (
              <ReferenceSelect
                label="Claim filter (optional)"
                value={references.claimId}
                emptyLabel="No claim filter"
                options={
                  casePackage?.claims.map((claim) => ({
                    id: claim.claim_id,
                    label: claim.text,
                  })) ?? []
                }
                onChange={(value) => selectReference("claimId", value)}
              />
            ) : null}

            {optionalReferences.includes("target_question_id") ? (
              <ReferenceSelect
                label="Question boundary (optional)"
                value={references.targetQuestionId}
                emptyLabel="No target question"
                options={AI_ASSISTANCE_QUESTION_SET_V01.map((item) => ({
                  id: item.question_id,
                  label: item.text,
                }))}
                onChange={(value) =>
                  selectReference("targetQuestionId", value)
                }
              />
            ) : null}

            {optionalReferences.includes("unavailable_reason") ? (
              <ReferenceSelect
                label="Unavailable reason (optional)"
                value={references.unavailableReason}
                emptyLabel="No reason selected"
                options={AI_ASSISTANCE_UNAVAILABLE_REASONS_V01.map(
                  (reason) => ({
                    id: reason,
                    label: formatCode(reason),
                  }),
                )}
                onChange={(value) =>
                  selectReference("unavailableReason", value)
                }
              />
            ) : null}
          </div>

          <div className="evidence-assistance-run-row">
            <button
              type="button"
              className="evidence-assistance-run"
              onClick={runMockAssistance}
              disabled={!casePackage}
            >
              Check package evidence
            </button>
            <code>{questionId}</code>
          </div>

          {casePackage ? (
            <EvidenceAssistanceResult
              resolution={resolution}
              onFocusEvidence={onFocusEvidence}
            />
          ) : (
            <AssistanceState
              status="unavailable"
              label="Unavailable"
              summary="A validated CasePackage is required before mocked assistance can run."
            />
          )}
        </div>
      </details>
    </section>
  );
}

export function EvidenceAssistanceResult({
  resolution,
  onFocusEvidence,
}: EvidenceAssistanceResultProps) {
  if (!resolution) {
    return (
      <AssistanceState
        status="idle"
        label="Ready"
        summary="Choose a fixed question and any required package reference."
      />
    );
  }

  if (
    resolution.status === "unavailable" ||
    resolution.status === "guardrail_refused"
  ) {
    const refused = resolution.status === "guardrail_refused";

    return (
      <AssistanceState
        status={resolution.status}
        label={refused ? "Guardrail refused" : "Unavailable"}
        summary={
          refused
            ? "The request is outside the fixed evidence-assistance boundary."
            : "The fixed question cannot run with the supplied package references."
        }
      >
        <ReferenceMetadata
          entries={[
            ["question_id", resolution.guardrail.question_id],
            ["guardrail_status", resolution.guardrail.status],
            ["reason_code", resolution.guardrail.reason_code],
            ["required_reference", resolution.guardrail.required_reference],
          ]}
        />
      </AssistanceState>
    );
  }

  if (resolution.status === "invalid_response") {
    return (
      <AssistanceState
        status="invalid_response"
        label="Invalid response withheld"
        summary="Mock output failed response validation and was not rendered."
      >
        <ReferenceMetadata
          entries={[
            ["question_id", resolution.guardrail.question_id],
            ...resolution.errors.map(
              (error) => [error.path, error.code] as const,
            ),
          ]}
        />
      </AssistanceState>
    );
  }

  if (!("response" in resolution)) {
    return (
      <AssistanceState
        status="unavailable"
        label="Unavailable"
        summary="The assistance result could not be displayed."
      />
    );
  }

  const { response, critic } = resolution;
  const label =
    resolution.status === "answered"
      ? "Answered"
      : resolution.status === "insufficient_evidence"
        ? "Insufficient evidence"
        : "Refused";

  return (
    <AssistanceState
      status={resolution.status}
      label={label}
      summary={response.answer.summary}
    >
      <ReferenceMetadata
        entries={[
          ["question_id", response.question.question_id],
          ["guardrail_status", resolution.guardrail.status],
          ["claim_id", resolution.guardrail.references.claim_id],
          ["evidence_id", resolution.guardrail.references.evidence_id],
          ["label_id", resolution.guardrail.references.label_id],
          [
            "target_question_id",
            resolution.guardrail.references.target_question_id,
          ],
          [
            "unavailable_reason",
            resolution.guardrail.references.unavailable_reason,
          ],
          ["response_id", response.response_id],
          ["package_id", response.case_package.package_id],
          ["answer_status", response.answer.status],
          ["critic_assessment", formatCode(critic.answer.assessment)],
        ]}
      />

      {response.answer.evidence_ids.length > 0 ? (
        <ReferenceList
          label="Answer evidence"
          ids={response.answer.evidence_ids}
          onActivate={onFocusEvidence}
        />
      ) : null}

      {response.answer.insufficiency_reason ? (
        <p className="evidence-assistance-reason">
          <strong>Why evidence is insufficient</strong>
          {response.answer.insufficiency_reason}
        </p>
      ) : null}

      {response.answer.refusal_reason ? (
        <p className="evidence-assistance-reason">
          <strong>Refusal reason</strong>
          {formatCode(response.answer.refusal_reason)}
        </p>
      ) : null}

      <div className="evidence-assistance-findings">
        <h4>Validated findings</h4>
        {response.findings.length > 0 ? (
          response.findings.map((finding) => (
            <article key={finding.finding_id}>
              <div className="evidence-assistance-finding-heading">
                <code>{finding.finding_id}</code>
                <span>{formatCode(finding.support)}</span>
              </div>
              <p>{finding.text}</p>
              <ReferenceList
                label="evidence_id"
                ids={finding.evidence_ids}
                onActivate={onFocusEvidence}
              />
              <ReferenceList
                label="claim_id"
                ids={finding.related_claim_ids ?? []}
              />
              <ReferenceList
                label="label_id"
                ids={finding.related_label_ids ?? []}
              />
              {finding.uncertainty ? (
                <p className="evidence-assistance-uncertainty">
                  <strong>
                    Uncertainty: {formatCode(finding.uncertainty.level)}
                  </strong>
                  {finding.uncertainty.explanation}
                </p>
              ) : null}
            </article>
          ))
        ) : (
          <p>No findings were returned inside the approved package boundary.</p>
        )}
      </div>

      <div className="evidence-assistance-warnings">
        <h4>Warnings</h4>
        {response.warnings?.length || resolution.validationWarnings.length ? (
          <ul>
            {response.warnings?.map((warning) => (
              <li key={warning.warning_id}>
                <code>{warning.code}</code> {warning.message}
              </li>
            ))}
            {resolution.validationWarnings.map((warning) => (
              <li key={`${warning.path}-${warning.code}`}>
                <code>{warning.code}</code> {warning.message}
              </li>
            ))}
          </ul>
        ) : (
          <p>No response or critic warnings.</p>
        )}
      </div>
    </AssistanceState>
  );
}

function ReferenceSelect({
  label,
  value,
  emptyLabel,
  options,
  onChange,
}: {
  label: string;
  value: string;
  emptyLabel: string;
  options: Array<{ id: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">{emptyLabel}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label} · {option.id}
          </option>
        ))}
      </select>
    </label>
  );
}

function AssistanceState({
  status,
  label,
  summary,
  children,
}: {
  status: string;
  label: string;
  summary: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`evidence-assistance-state evidence-assistance-state-${status}`}
      aria-live="polite"
    >
      <div className="evidence-assistance-status-line">
        <span aria-hidden="true">{statusSymbol(status)}</span>
        <strong>Status: {label}</strong>
      </div>
      <p>{summary}</p>
      {children}
    </div>
  );
}

function ReferenceMetadata({
  entries,
}: {
  entries: ReadonlyArray<readonly [string, string | undefined]>;
}) {
  const visibleEntries = entries.filter((entry) => Boolean(entry[1]));

  if (visibleEntries.length === 0) {
    return null;
  }

  return (
    <dl className="evidence-assistance-metadata">
      {visibleEntries.map(([label, value]) => (
        <div key={`${label}-${value}`}>
          <dt>{formatMetadataLabel(label)}</dt>
          <dd>
            <code>{value}</code>
          </dd>
        </div>
      ))}
    </dl>
  );
}

function ReferenceList({
  label,
  ids,
  onActivate,
}: {
  label: string;
  ids: readonly string[];
  onActivate?: (id: string) => void;
}) {
  if (ids.length === 0) {
    return null;
  }

  return (
    <div className="evidence-assistance-reference-list">
      <span>{label}</span>
      <div>
        {ids.map((id) =>
          onActivate ? (
            <button key={id} type="button" onClick={() => onActivate(id)}>
              {id}
            </button>
          ) : (
            <code key={id}>{id}</code>
          ),
        )}
      </div>
    </div>
  );
}

function buildGuardrailReferences(references: AssistanceReferenceSelection) {
  return {
    ...(references.claimId ? { claim_id: references.claimId } : {}),
    ...(references.evidenceId ? { evidence_id: references.evidenceId } : {}),
    ...(references.labelId ? { label_id: references.labelId } : {}),
    ...(references.targetQuestionId
      ? { target_question_id: references.targetQuestionId }
      : {}),
    ...(references.unavailableReason
      ? { unavailable_reason: references.unavailableReason }
      : {}),
  };
}

function statusSymbol(status: string): string {
  if (status === "answered") return "✓";
  if (status === "insufficient_evidence") return "?";
  if (status === "refused" || status === "guardrail_refused") return "—";
  if (status === "unavailable") return "×";
  if (status === "invalid_response") return "!";
  return "·";
}

function formatCode(value: string): string {
  return value.replaceAll("_", " ");
}

function formatMetadataLabel(value: string): string {
  const label = formatCode(value);
  return `${label.charAt(0).toUpperCase()}${label.slice(1)}`;
}
