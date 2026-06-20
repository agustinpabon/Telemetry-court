import type { CaseFile, LandscapeContextNode } from "@/lib/types";

const sampleCasesData: CaseFile[] = [
  {
    id: "case-arena-001",
    dataset: "Synthetic CloudTrail Workshop Pack",
    reviewStatus: "needs_evidence",
    landscapeStatus: "overclaimed",
    modelAgreement: 0.42,
    evidenceStrength: 0.38,
    uncertainty: 0.72,
    mapPosition: { x: 18, y: 62 },
    topFeatures: [
      "CreateRole",
      "AttachRolePolicy",
      "TagRole",
      "iam:PassRole absent",
      "daytime change window",
      "rollout metadata",
    ],
    riskFlags: ["Intent not evidenced", "Administrative mutations", "No persistence signal"],
    nearestNeighbor: {
      clusterId: "cluster-iam-041",
      label: "Standard platform role lifecycle",
      distance: 0.18,
      note: "Nearest synthetic neighbour shares role creation and tagging, but has clearer ticket metadata.",
    },
    cluster: {
      id: "cluster-iam-029",
      name: "IAM role provisioning region",
      description:
        "Synthetic sessions dominated by role creation, policy attachment, tagging, and rollout metadata.",
      source: "sample",
      size: 126,
    },
    topicLabel: {
      id: "label-iam-029-a",
      clusterId: "cluster-iam-029",
      name: "Suspicious IAM privilege escalation",
      explanation:
        "The baseline model labels this region as suspicious IAM privilege escalation because roles are created and policies are attached. The evidence does not show malicious intent or privilege abuse.",
      generatedBy: "Baseline AI labeler v0.7",
      generatedAt: "2026-06-13T13:10:00Z",
    },
    blindInterpretationOptions: [
      {
        id: "routine-iam-provisioning",
        label: "Routine IAM role provisioning",
        helper: "Role creation and policy attachment are present, but intent is not proven.",
      },
      {
        id: "suspicious-privilege-escalation",
        label: "Possible privilege escalation",
        helper: "Would require stronger evidence of unauthorized privilege expansion.",
      },
      {
        id: "cloud-resource-discovery",
        label: "Cloud resource discovery",
        helper: "Discovery reads are not the dominant evidence in this case.",
      },
      {
        id: "not-enough-evidence",
        label: "Not enough evidence",
        helper: "Use when the evidence supports activity but not an interpretation.",
      },
      {
        id: "none-of-these",
        label: "None of these",
        helper: "The structured choices do not fit the observed evidence.",
      },
    ],
    candidateLabels: [
      {
        id: "label-iam-baseline",
        source: "baseline_ai",
        label: "Suspicious IAM privilege escalation",
        rationale:
          "Overweights role creation and policy attachment without evidence of unauthorized use.",
        supportEstimate: 0.24,
      },
      {
        id: "label-iam-constrained",
        source: "evidence_constrained_ai",
        label: "Routine IAM role provisioning",
        rationale:
          "Matches the administrative change sequence and avoids inferring malicious intent.",
        supportEstimate: 0.86,
      },
      {
        id: "label-iam-human",
        source: "human_style",
        label: "Platform role rollout with policy attachment",
        rationale:
          "More specific than routine provisioning, but still grounded in observed role lifecycle evidence.",
        supportEstimate: 0.78,
      },
      {
        id: "label-iam-uncertain",
        source: "uncertain_label",
        label: "IAM administration with unknown intent",
        rationale:
          "Useful when the reviewer wants to preserve uncertainty about operator intent.",
        supportEstimate: 0.64,
      },
    ],
    seededBestLabelId: "label-iam-constrained",
    seededImpostorSessionId: "iam-s-04",
    representativeSessions: [
      {
        id: "iam-s-01",
        title: "Role created for analytics connector",
        principal: "platform-deploy-role",
        timestamp: "2026-06-12T14:10:00Z",
        featureOverlap: 0.91,
        outlierScore: 0.12,
        summary: "CreateRole, TagRole, AttachRolePolicy, and ticket-like tag metadata.",
      },
      {
        id: "iam-s-02",
        title: "Policy attached during rollout",
        principal: "platform-deploy-role",
        timestamp: "2026-06-12T14:22:00Z",
        featureOverlap: 0.87,
        outlierScore: 0.18,
        summary: "AttachRolePolicy follows role naming convention for connector onboarding.",
      },
      {
        id: "iam-s-03",
        title: "Role validation checks",
        principal: "identity-automation",
        timestamp: "2026-06-12T14:31:00Z",
        featureOverlap: 0.76,
        outlierScore: 0.28,
        summary: "GetRole and ListAttachedRolePolicies confirm expected configuration.",
      },
      {
        id: "iam-s-04",
        title: "Cross-account PassRole probe",
        principal: "unknown-ci-session",
        timestamp: "2026-06-12T03:48:00Z",
        featureOverlap: 0.29,
        outlierScore: 0.82,
        summary: "PassRole-style access check appears off-hours and lacks rollout tags.",
        outlierReason:
          "Lowest feature overlap and highest outlier score; this session is unlike the provisioning majority.",
      },
      {
        id: "iam-s-05",
        title: "Cleanup tag added",
        principal: "platform-deploy-role",
        timestamp: "2026-06-12T15:05:00Z",
        featureOverlap: 0.73,
        outlierScore: 0.24,
        summary: "Tags role with owner and expiration metadata after deployment.",
      },
    ],
    failureModes: [
      "less_overclaimed",
      "missing_evidence",
      "cluster_seems_mixed",
      "better_supported",
    ],
    defaultEvidenceRatings: {
      "iam-e-01": "weak_support",
      "iam-e-02": "contradicts_label",
      "iam-e-03": "contradicts_label",
      "iam-e-04": "needs_context",
    },
    claims: [
      {
        id: "iam-c-01",
        clusterId: "cluster-iam-029",
        topicLabelId: "label-iam-029-a",
        text: "The cluster contains role creation and policy attachment activity.",
        status: "supported",
        supportScore: 0.92,
        rationale:
          "Synthetic feature summaries directly show role lifecycle mutations.",
      },
      {
        id: "iam-c-02",
        clusterId: "cluster-iam-029",
        topicLabelId: "label-iam-029-a",
        text: "The evidence proves suspicious or malicious privilege escalation.",
        status: "unsupported",
        supportScore: 0.16,
        rationale:
          "No synthetic evidence shows unauthorized intent, persistence, misuse, or post-change abuse.",
      },
      {
        id: "iam-c-03",
        clusterId: "cluster-iam-029",
        topicLabelId: "label-iam-029-a",
        text: "The region mostly resembles a planned provisioning workflow.",
        status: "weakly_supported",
        supportScore: 0.66,
        rationale:
          "Rollout timing and tags support routine provisioning, but one off-hours session weakens purity.",
      },
    ],
    evidenceItems: [
      {
        id: "iam-e-01",
        clusterId: "cluster-iam-029",
        title: "Role lifecycle feature stack",
        summary:
          "Synthetic salient features include CreateRole, AttachRolePolicy, PutRolePolicy, and TagRole.",
        sourceType: "session_feature",
        rawReference: "sample/cloudtrail/iam-029/features",
      },
      {
        id: "iam-e-02",
        clusterId: "cluster-iam-029",
        title: "Rollout metadata",
        summary:
          "Most sessions occur during a daytime platform rollout window and carry owner tags.",
        sourceType: "metadata",
        rawReference: "sample/cloudtrail/iam-029/rollout",
      },
      {
        id: "iam-e-03",
        clusterId: "cluster-iam-029",
        title: "No post-change abuse evidence",
        summary:
          "The synthetic evidence packet has no downstream use of newly created roles for sensitive data access.",
        sourceType: "analyst_note",
        rawReference: "sample/cloudtrail/iam-029/absence-note",
      },
      {
        id: "iam-e-04",
        clusterId: "cluster-iam-029",
        title: "Off-hours PassRole-like probe",
        summary:
          "One representative session has low feature overlap and a PassRole-style check outside the rollout window.",
        sourceType: "exemplar",
        rawReference: "sample/cloudtrail/iam-029/session-04",
      },
    ],
    evidenceRelations: [
      {
        claimId: "iam-c-01",
        evidenceId: "iam-e-01",
        polarity: "supports",
        strength: "strong",
        explanation:
          "Role lifecycle features directly support the narrow administrative-activity claim.",
      },
      {
        claimId: "iam-c-02",
        evidenceId: "iam-e-02",
        polarity: "contradicts",
        strength: "moderate",
        explanation:
          "Rollout context weakens the suspicious escalation interpretation.",
      },
      {
        claimId: "iam-c-02",
        evidenceId: "iam-e-03",
        polarity: "contradicts",
        strength: "strong",
        explanation:
          "The absence of downstream abuse contradicts a confident malicious escalation claim.",
      },
      {
        claimId: "iam-c-03",
        evidenceId: "iam-e-04",
        polarity: "neutral",
        strength: "moderate",
        explanation:
          "The off-hours session needs context and may indicate cluster impurity rather than malicious majority behavior.",
      },
    ],
    supportScores: [
      {
        claimId: "iam-c-01",
        value: 0.92,
        status: "supported",
        rationale: "Strong support for administrative role changes.",
      },
      {
        claimId: "iam-c-02",
        value: 0.16,
        status: "unsupported",
        rationale: "The suspicious intent claim is not evidenced.",
      },
      {
        claimId: "iam-c-03",
        value: 0.66,
        status: "weakly_supported",
        rationale: "Mostly routine, with one session requiring context.",
      },
    ],
    analystVerdict: {
      decision: "revise",
      summary:
        "The better supported label is routine IAM role provisioning; the suspicious escalation label overclaims intent.",
      reviewer: "Synthetic reviewer",
      reviewedAt: "2026-06-13T13:28:00Z",
    },
  },
  {
    id: "case-arena-002",
    dataset: "Synthetic Endpoint Workshop Pack",
    reviewStatus: "reviewed",
    landscapeStatus: "supported",
    modelAgreement: 0.88,
    evidenceStrength: 0.91,
    uncertainty: 0.18,
    mapPosition: { x: 48, y: 34 },
    topFeatures: [
      "powershell -EncodedCommand",
      "Base64-like payload",
      "rare parent process",
      "external HTTPS connection",
      "new child process",
    ],
    riskFlags: ["External connection", "Encoded command", "Rare parent process"],
    nearestNeighbor: {
      clusterId: "cluster-endpoint-072",
      label: "Scripted admin PowerShell",
      distance: 0.31,
      note: "Neighbour has PowerShell automation but lacks encoded payload and external callback.",
    },
    cluster: {
      id: "cluster-endpoint-064",
      name: "Encoded PowerShell region",
      description:
        "Synthetic endpoint sessions with encoded PowerShell, unusual process ancestry, and outbound network activity.",
      source: "sample",
      size: 58,
    },
    topicLabel: {
      id: "label-endpoint-064-a",
      clusterId: "cluster-endpoint-064",
      name: "Encoded PowerShell with external communication",
      explanation:
        "The baseline model claims the region combines encoded PowerShell execution with external network communication. The synthetic evidence strongly supports that claim.",
      generatedBy: "Baseline AI labeler v0.7",
      generatedAt: "2026-06-13T13:16:00Z",
    },
    blindInterpretationOptions: [
      {
        id: "encoded-powershell-external",
        label: "Encoded PowerShell with external communication",
        helper: "Encoded command evidence and outbound connection both appear.",
      },
      {
        id: "routine-admin-script",
        label: "Routine administrator script execution",
        helper: "Would require owner metadata or expected scheduling evidence.",
      },
      {
        id: "software-update-script",
        label: "Software update script",
        helper: "The evidence lacks a known updater identity.",
      },
      {
        id: "not-enough-evidence",
        label: "Not enough evidence",
        helper: "Use when the packet does not establish the behavioral pattern.",
      },
      {
        id: "none-of-these",
        label: "None of these",
        helper: "The structured choices do not fit the observed evidence.",
      },
    ],
    candidateLabels: [
      {
        id: "label-ps-baseline",
        source: "baseline_ai",
        label: "Encoded PowerShell with external communication",
        rationale:
          "Directly names the two strongest supported behaviors without asserting confirmed compromise.",
        supportEstimate: 0.91,
      },
      {
        id: "label-ps-constrained",
        source: "evidence_constrained_ai",
        label: "Unusual encoded PowerShell plus outbound HTTPS",
        rationale:
          "Slightly more cautious, preserving uncertainty around intent.",
        supportEstimate: 0.88,
      },
      {
        id: "label-ps-human",
        source: "human_style",
        label: "Suspicious encoded script execution with network follow-up",
        rationale:
          "Analyst-useful and grounded, but adds suspiciousness from context.",
        supportEstimate: 0.82,
      },
      {
        id: "label-ps-uncertain",
        source: "uncertain_label",
        label: "Possible scripted endpoint activity",
        rationale: "Too vague for the strength of the synthetic evidence packet.",
        supportEstimate: 0.46,
      },
    ],
    seededBestLabelId: "label-ps-baseline",
    seededImpostorSessionId: "ps-s-05",
    representativeSessions: [
      {
        id: "ps-s-01",
        title: "Encoded command opens HTTPS connection",
        principal: "workstation-17\\user-a",
        timestamp: "2026-06-10T18:42:00Z",
        featureOverlap: 0.94,
        outlierScore: 0.09,
        summary:
          "PowerShell encoded command followed by external HTTPS connection to rare domain.",
      },
      {
        id: "ps-s-02",
        title: "Rare parent launches PowerShell",
        principal: "workstation-22\\user-b",
        timestamp: "2026-06-10T19:03:00Z",
        featureOverlap: 0.89,
        outlierScore: 0.14,
        summary:
          "Document process spawns encoded PowerShell and creates a short-lived network connection.",
      },
      {
        id: "ps-s-03",
        title: "Encoded command creates child process",
        principal: "workstation-31\\user-c",
        timestamp: "2026-06-10T19:14:00Z",
        featureOverlap: 0.86,
        outlierScore: 0.2,
        summary:
          "Base64-like command line and child process creation match the region pattern.",
      },
      {
        id: "ps-s-04",
        title: "External callback after script execution",
        principal: "workstation-18\\user-a",
        timestamp: "2026-06-10T19:25:00Z",
        featureOverlap: 0.81,
        outlierScore: 0.22,
        summary: "Outbound HTTPS begins within seconds of encoded script execution.",
      },
      {
        id: "ps-s-05",
        title: "Signed admin script without network",
        principal: "admin-jumpbox\\svc-maint",
        timestamp: "2026-06-10T20:00:00Z",
        featureOverlap: 0.34,
        outlierScore: 0.76,
        summary:
          "Signed maintenance script uses PowerShell but has no encoded payload or external connection.",
        outlierReason:
          "PowerShell alone is not enough; this session lacks the encoded and external-communication features.",
      },
    ],
    failureModes: ["better_supported", "more_specific", "less_overclaimed"],
    defaultEvidenceRatings: {
      "ps-e-01": "supports_label",
      "ps-e-02": "supports_label",
      "ps-e-03": "supports_label",
      "ps-e-04": "needs_context",
    },
    claims: [
      {
        id: "ps-c-01",
        clusterId: "cluster-endpoint-064",
        topicLabelId: "label-endpoint-064-a",
        text: "The region contains encoded PowerShell execution.",
        status: "supported",
        supportScore: 0.95,
        rationale:
          "Command-line summaries show encoded command patterns across representative sessions.",
      },
      {
        id: "ps-c-02",
        clusterId: "cluster-endpoint-064",
        topicLabelId: "label-endpoint-064-a",
        text: "Encoded execution is followed by external network communication.",
        status: "supported",
        supportScore: 0.88,
        rationale:
          "Multiple sessions show external HTTPS soon after encoded PowerShell launch.",
      },
      {
        id: "ps-c-03",
        clusterId: "cluster-endpoint-064",
        topicLabelId: "label-endpoint-064-a",
        text: "The evidence proves a named malware family.",
        status: "unsupported",
        supportScore: 0.08,
        rationale:
          "The synthetic packet contains behavior evidence, not family attribution evidence.",
      },
    ],
    evidenceItems: [
      {
        id: "ps-e-01",
        clusterId: "cluster-endpoint-064",
        title: "Encoded command-line feature",
        summary:
          "Representative command lines include -EncodedCommand and Base64-like payload length.",
        sourceType: "session_feature",
        rawReference: "sample/endpoint/ps-064/command-lines",
      },
      {
        id: "ps-e-02",
        clusterId: "cluster-endpoint-064",
        title: "Outbound HTTPS follow-up",
        summary:
          "Synthetic network metadata shows external HTTPS connections within 20 seconds of execution.",
        sourceType: "telemetry_event",
        rawReference: "sample/endpoint/ps-064/network",
      },
      {
        id: "ps-e-03",
        clusterId: "cluster-endpoint-064",
        title: "Rare parent process",
        summary:
          "Several sessions are launched by unusual document or scripting parents for the host baseline.",
        sourceType: "metadata",
        rawReference: "sample/endpoint/ps-064/process-tree",
      },
      {
        id: "ps-e-04",
        clusterId: "cluster-endpoint-064",
        title: "No malware-family attribution",
        summary:
          "The packet does not include signatures, sandbox verdicts, or family-specific indicators.",
        sourceType: "analyst_note",
        rawReference: "sample/endpoint/ps-064/attribution-note",
      },
    ],
    evidenceRelations: [
      {
        claimId: "ps-c-01",
        evidenceId: "ps-e-01",
        polarity: "supports",
        strength: "strong",
        explanation: "Encoded command-line features directly support the encoded PowerShell claim.",
      },
      {
        claimId: "ps-c-02",
        evidenceId: "ps-e-02",
        polarity: "supports",
        strength: "strong",
        explanation: "Network timing directly supports external communication after execution.",
      },
      {
        claimId: "ps-c-02",
        evidenceId: "ps-e-03",
        polarity: "supports",
        strength: "moderate",
        explanation: "Rare parent process context strengthens the unusual behavior interpretation.",
      },
      {
        claimId: "ps-c-03",
        evidenceId: "ps-e-04",
        polarity: "contradicts",
        strength: "strong",
        explanation: "No family-attribution evidence is present.",
      },
    ],
    supportScores: [
      {
        claimId: "ps-c-01",
        value: 0.95,
        status: "supported",
        rationale: "Strong direct support from command-line features.",
      },
      {
        claimId: "ps-c-02",
        value: 0.88,
        status: "supported",
        rationale: "Strong support from network event timing.",
      },
      {
        claimId: "ps-c-03",
        value: 0.08,
        status: "unsupported",
        rationale: "Attribution is outside the evidence packet.",
      },
    ],
    analystVerdict: {
      decision: "accept",
      summary:
        "The behavioral label is supported as long as it does not overclaim malware attribution.",
      reviewer: "Synthetic reviewer",
      reviewedAt: "2026-06-13T13:33:00Z",
    },
  },
  {
    id: "case-arena-003",
    dataset: "Synthetic Windows Operations Pack",
    reviewStatus: "needs_split",
    landscapeStatus: "impure",
    modelAgreement: 0.53,
    evidenceStrength: 0.58,
    uncertainty: 0.63,
    mapPosition: { x: 68, y: 66 },
    topFeatures: [
      "service restart",
      "msiexec child process",
      "signed updater",
      "rare remote admin",
      "two low-overlap sessions",
    ],
    riskFlags: ["Cluster purity concern", "Outlier sessions", "Mixed parent processes"],
    nearestNeighbor: {
      clusterId: "cluster-win-021",
      label: "Routine Windows service maintenance",
      distance: 0.22,
      note: "Neighbour lacks remote-admin and unsigned script sessions.",
    },
    cluster: {
      id: "cluster-win-019",
      name: "Windows service maintenance region",
      description:
        "Synthetic service update sessions mixed with one remote-admin script and one unrelated installer pattern.",
      source: "sample",
      size: 84,
    },
    topicLabel: {
      id: "label-win-019-a",
      clusterId: "cluster-win-019",
      name: "Windows service update activity",
      explanation:
        "The label is plausible for most sessions, but the region includes outliers that weaken the single-story interpretation.",
      generatedBy: "Baseline AI labeler v0.7",
      generatedAt: "2026-06-13T13:21:00Z",
    },
    blindInterpretationOptions: [
      {
        id: "service-update",
        label: "Windows service update activity",
        helper: "Most sessions show updater and service-restart features.",
      },
      {
        id: "mixed-impure-cluster",
        label: "Mixed / impure cluster",
        helper: "Use if outlier sessions materially weaken the region story.",
      },
      {
        id: "remote-admin-script",
        label: "Remote administration script",
        helper: "Only one session strongly matches this pattern.",
      },
      {
        id: "not-enough-evidence",
        label: "Not enough evidence",
        helper: "Use when the packet cannot support a coherent label.",
      },
      {
        id: "none-of-these",
        label: "None of these",
        helper: "The structured choices do not fit the observed evidence.",
      },
    ],
    candidateLabels: [
      {
        id: "label-win-baseline",
        source: "baseline_ai",
        label: "Windows service update activity",
        rationale:
          "Reasonable for the majority behavior but hides impurity in representative sessions.",
        supportEstimate: 0.62,
      },
      {
        id: "label-win-constrained",
        source: "evidence_constrained_ai",
        label: "Mostly service updates with outlier admin sessions",
        rationale:
          "Preserves the main pattern and explicitly discloses cluster impurity.",
        supportEstimate: 0.84,
      },
      {
        id: "label-win-human",
        source: "human_style",
        label: "Split candidate: service updates plus remote admin",
        rationale:
          "Most useful for review because it recommends a cluster action.",
        supportEstimate: 0.8,
      },
      {
        id: "label-win-uncertain",
        source: "uncertain_label",
        label: "Mixed Windows maintenance activity",
        rationale: "Cautious, but less specific about the outlier cause.",
        supportEstimate: 0.66,
      },
    ],
    seededBestLabelId: "label-win-constrained",
    seededImpostorSessionId: "win-s-04",
    representativeSessions: [
      {
        id: "win-s-01",
        title: "Updater restarts service",
        principal: "svc-updater",
        timestamp: "2026-06-09T09:12:00Z",
        featureOverlap: 0.9,
        outlierScore: 0.11,
        summary: "Signed updater stops service, installs package, and restarts service.",
      },
      {
        id: "win-s-02",
        title: "Maintenance window package install",
        principal: "svc-updater",
        timestamp: "2026-06-09T09:36:00Z",
        featureOverlap: 0.84,
        outlierScore: 0.18,
        summary: "msiexec child process and service restart during approved window.",
      },
      {
        id: "win-s-03",
        title: "Service health check",
        principal: "svc-updater",
        timestamp: "2026-06-09T10:02:00Z",
        featureOverlap: 0.78,
        outlierScore: 0.23,
        summary: "Queries service status and records update completion metadata.",
      },
      {
        id: "win-s-04",
        title: "Remote admin script touches service",
        principal: "admin-remote-7",
        timestamp: "2026-06-09T02:17:00Z",
        featureOverlap: 0.26,
        outlierScore: 0.88,
        summary:
          "Remote shell launches unsigned script that stops a service outside the update window.",
        outlierReason:
          "This has the highest outlier score and does not share updater signing, timing, or package features.",
      },
      {
        id: "win-s-05",
        title: "Unrelated installer",
        principal: "desktop-user",
        timestamp: "2026-06-09T11:44:00Z",
        featureOverlap: 0.41,
        outlierScore: 0.69,
        summary:
          "Installer activity shares msiexec but does not restart the same service family.",
      },
    ],
    failureModes: ["cluster_seems_mixed", "better_supported", "more_specific"],
    defaultEvidenceRatings: {
      "win-e-01": "supports_label",
      "win-e-02": "weak_support",
      "win-e-03": "contradicts_label",
      "win-e-04": "needs_context",
    },
    claims: [
      {
        id: "win-c-01",
        clusterId: "cluster-win-019",
        topicLabelId: "label-win-019-a",
        text: "Most sessions resemble Windows service update activity.",
        status: "supported",
        supportScore: 0.78,
        rationale:
          "The majority has signed updater, package install, and service restart features.",
      },
      {
        id: "win-c-02",
        clusterId: "cluster-win-019",
        topicLabelId: "label-win-019-a",
        text: "The cluster is pure enough for a single label.",
        status: "contradicted",
        supportScore: 0.24,
        rationale:
          "Outlier sessions have low feature overlap and different operator context.",
      },
      {
        id: "win-c-03",
        clusterId: "cluster-win-019",
        topicLabelId: "label-win-019-a",
        text: "The case may need a split before accepting the label.",
        status: "weakly_supported",
        supportScore: 0.68,
        rationale:
          "Two low-overlap sessions suggest impurity, though sample size is limited.",
      },
    ],
    evidenceItems: [
      {
        id: "win-e-01",
        clusterId: "cluster-win-019",
        title: "Updater and service restart features",
        summary:
          "Most sessions include signed updater execution, package install, and service restart.",
        sourceType: "session_feature",
        rawReference: "sample/windows/win-019/features",
      },
      {
        id: "win-e-02",
        clusterId: "cluster-win-019",
        title: "Maintenance window metadata",
        summary:
          "Three high-overlap sessions occur inside a defined maintenance window.",
        sourceType: "metadata",
        rawReference: "sample/windows/win-019/window",
      },
      {
        id: "win-e-03",
        clusterId: "cluster-win-019",
        title: "Low-overlap remote admin session",
        summary:
          "One session has remote shell parentage, unsigned script execution, and off-hours timing.",
        sourceType: "exemplar",
        rawReference: "sample/windows/win-019/session-04",
      },
      {
        id: "win-e-04",
        clusterId: "cluster-win-019",
        title: "Second weak outlier",
        summary:
          "An unrelated installer session shares msiexec but lacks the service-family pattern.",
        sourceType: "exemplar",
        rawReference: "sample/windows/win-019/session-05",
      },
    ],
    evidenceRelations: [
      {
        claimId: "win-c-01",
        evidenceId: "win-e-01",
        polarity: "supports",
        strength: "strong",
        explanation: "The dominant feature set supports the service-update label for most sessions.",
      },
      {
        claimId: "win-c-01",
        evidenceId: "win-e-02",
        polarity: "supports",
        strength: "moderate",
        explanation: "Timing metadata adds context for routine update activity.",
      },
      {
        claimId: "win-c-02",
        evidenceId: "win-e-03",
        polarity: "contradicts",
        strength: "strong",
        explanation: "Remote admin outlier contradicts cluster purity.",
      },
      {
        claimId: "win-c-03",
        evidenceId: "win-e-04",
        polarity: "supports",
        strength: "moderate",
        explanation: "A second weak outlier supports a split review.",
      },
    ],
    supportScores: [
      {
        claimId: "win-c-01",
        value: 0.78,
        status: "supported",
        rationale: "Majority support from updater features.",
      },
      {
        claimId: "win-c-02",
        value: 0.24,
        status: "contradicted",
        rationale: "Outliers contradict a pure-cluster claim.",
      },
      {
        claimId: "win-c-03",
        value: 0.68,
        status: "weakly_supported",
        rationale: "Split recommendation is plausible but needs more review.",
      },
    ],
    analystVerdict: {
      decision: "revise",
      summary:
        "The label fits most sessions, but the case should be marked impure and considered for split.",
      reviewer: "Synthetic reviewer",
      reviewedAt: "2026-06-13T13:39:00Z",
    },
  },
  {
    id: "case-arena-004",
    dataset: "Synthetic CloudTrail Workshop Pack",
    reviewStatus: "in_review",
    landscapeStatus: "too_broad",
    modelAgreement: 0.61,
    evidenceStrength: 0.74,
    uncertainty: 0.4,
    mapPosition: { x: 34, y: 26 },
    topFeatures: [
      "AssumeRole",
      "ListBuckets",
      "GetBucketLocation",
      "ListBucket",
      "no object reads",
    ],
    riskFlags: ["Label too broad", "Specific cloud resource pattern", "No exfil evidence"],
    nearestNeighbor: {
      clusterId: "cluster-s3-015",
      label: "General cloud console navigation",
      distance: 0.29,
      note: "Neighbour has broader console reads; this case is S3-specific after role assumption.",
    },
    cluster: {
      id: "cluster-s3-044",
      name: "S3 enumeration region",
      description:
        "Synthetic cloud sessions showing role assumption followed by bucket listing and location checks.",
      source: "sample",
      size: 112,
    },
    topicLabel: {
      id: "label-s3-044-a",
      clusterId: "cluster-s3-044",
      name: "Cloud administration activity",
      explanation:
        "The baseline label is not false, but it is too broad for evidence that specifically shows S3 bucket enumeration after role assumption.",
      generatedBy: "Baseline AI labeler v0.7",
      generatedAt: "2026-06-13T13:26:00Z",
    },
    blindInterpretationOptions: [
      {
        id: "s3-enumeration-role",
        label: "S3 bucket enumeration after role assumption",
        helper: "Role assumption and bucket-list features dominate the packet.",
      },
      {
        id: "cloud-admin-activity",
        label: "Cloud administration activity",
        helper: "Broadly true, but may hide the specific behavior.",
      },
      {
        id: "data-exfiltration",
        label: "Cloud data exfiltration",
        helper: "Would require object access, transfer, or destination evidence.",
      },
      {
        id: "not-enough-evidence",
        label: "Not enough evidence",
        helper: "Use when the packet cannot support a specific interpretation.",
      },
      {
        id: "none-of-these",
        label: "None of these",
        helper: "The structured choices do not fit the observed evidence.",
      },
    ],
    candidateLabels: [
      {
        id: "label-s3-baseline",
        source: "baseline_ai",
        label: "Cloud administration activity",
        rationale:
          "Directionally true but too broad to be analyst-useful for this evidence packet.",
        supportEstimate: 0.56,
      },
      {
        id: "label-s3-constrained",
        source: "evidence_constrained_ai",
        label: "S3 bucket enumeration after role assumption",
        rationale:
          "Best matches the specific sequence and avoids implying data access.",
        supportEstimate: 0.9,
      },
      {
        id: "label-s3-human",
        source: "human_style",
        label: "Role-assumed S3 discovery workflow",
        rationale:
          "Concise and grounded, with slightly less detail than the constrained label.",
        supportEstimate: 0.82,
      },
      {
        id: "label-s3-uncertain",
        source: "uncertain_label",
        label: "Possible cloud resource discovery",
        rationale: "Grounded but less specific than the available S3 evidence allows.",
        supportEstimate: 0.7,
      },
    ],
    seededBestLabelId: "label-s3-constrained",
    seededImpostorSessionId: "s3-s-05",
    representativeSessions: [
      {
        id: "s3-s-01",
        title: "AssumeRole then ListBuckets",
        principal: "cloud-audit-role",
        timestamp: "2026-06-11T12:08:00Z",
        featureOverlap: 0.92,
        outlierScore: 0.1,
        summary: "AssumeRole followed by ListBuckets and GetBucketLocation.",
      },
      {
        id: "s3-s-02",
        title: "Bucket region enumeration",
        principal: "cloud-audit-role",
        timestamp: "2026-06-11T12:19:00Z",
        featureOverlap: 0.87,
        outlierScore: 0.16,
        summary: "Lists buckets and checks locations without object reads.",
      },
      {
        id: "s3-s-03",
        title: "Repeated ListBucket calls",
        principal: "audit-lambda-role",
        timestamp: "2026-06-11T12:33:00Z",
        featureOverlap: 0.8,
        outlierScore: 0.24,
        summary: "Enumerates bucket names and selected prefixes.",
      },
      {
        id: "s3-s-04",
        title: "Permission boundary check",
        principal: "cloud-audit-role",
        timestamp: "2026-06-11T12:47:00Z",
        featureOverlap: 0.69,
        outlierScore: 0.34,
        summary: "AccessDenied events while checking bucket metadata.",
      },
      {
        id: "s3-s-05",
        title: "EC2 security group edit",
        principal: "network-admin-role",
        timestamp: "2026-06-11T13:02:00Z",
        featureOverlap: 0.22,
        outlierScore: 0.81,
        summary: "AuthorizeSecurityGroupIngress appears without S3 calls.",
        outlierReason:
          "This is cloud administration, but it lacks the S3 enumeration feature stack.",
      },
    ],
    failureModes: ["too_broad", "more_specific", "better_supported"],
    defaultEvidenceRatings: {
      "s3-e-01": "supports_label",
      "s3-e-02": "weak_support",
      "s3-e-03": "contradicts_label",
      "s3-e-04": "supports_label",
    },
    claims: [
      {
        id: "s3-c-01",
        clusterId: "cluster-s3-044",
        topicLabelId: "label-s3-044-a",
        text: "The region contains cloud administration activity.",
        status: "supported",
        supportScore: 0.76,
        rationale:
          "The evidence does show cloud control-plane actions, so the broad label is not false.",
      },
      {
        id: "s3-c-02",
        clusterId: "cluster-s3-044",
        topicLabelId: "label-s3-044-a",
        text: "The label is specific enough to describe the dominant behavior.",
        status: "unsupported",
        supportScore: 0.22,
        rationale:
          "Dominant evidence points specifically to S3 bucket enumeration after role assumption.",
      },
      {
        id: "s3-c-03",
        clusterId: "cluster-s3-044",
        topicLabelId: "label-s3-044-a",
        text: "The evidence supports data exfiltration.",
        status: "contradicted",
        supportScore: 0.14,
        rationale:
          "No object reads, transfers, or destination evidence appear in the synthetic packet.",
      },
    ],
    evidenceItems: [
      {
        id: "s3-e-01",
        clusterId: "cluster-s3-044",
        title: "Role assumption before S3 reads",
        summary:
          "Representative sessions start with AssumeRole and then perform S3 list and location calls.",
        sourceType: "telemetry_event",
        rawReference: "sample/cloudtrail/s3-044/sequence",
      },
      {
        id: "s3-e-02",
        clusterId: "cluster-s3-044",
        title: "Bucket enumeration features",
        summary:
          "Top features include ListBuckets, GetBucketLocation, and ListBucket without object retrieval.",
        sourceType: "session_feature",
        rawReference: "sample/cloudtrail/s3-044/features",
      },
      {
        id: "s3-e-03",
        clusterId: "cluster-s3-044",
        title: "No object access evidence",
        summary:
          "The packet contains no GetObject, bulk transfer, or external destination indicators.",
        sourceType: "analyst_note",
        rawReference: "sample/cloudtrail/s3-044/no-object-access",
      },
      {
        id: "s3-e-04",
        clusterId: "cluster-s3-044",
        title: "Nearest neighbour comparison",
        summary:
          "The closest broad cloud-admin neighbour includes EC2 and IAM actions absent from this region.",
        sourceType: "metadata",
        rawReference: "sample/cloudtrail/s3-044/neighbour",
      },
    ],
    evidenceRelations: [
      {
        claimId: "s3-c-01",
        evidenceId: "s3-e-01",
        polarity: "supports",
        strength: "moderate",
        explanation: "The sequence is cloud administration, but that label is broad.",
      },
      {
        claimId: "s3-c-02",
        evidenceId: "s3-e-02",
        polarity: "contradicts",
        strength: "strong",
        explanation:
          "The specific S3 feature stack contradicts the idea that a broad label is sufficient.",
      },
      {
        claimId: "s3-c-03",
        evidenceId: "s3-e-03",
        polarity: "contradicts",
        strength: "strong",
        explanation: "Missing object access contradicts an exfiltration interpretation.",
      },
      {
        claimId: "s3-c-02",
        evidenceId: "s3-e-04",
        polarity: "supports",
        strength: "moderate",
        explanation: "Neighbour comparison supports narrowing the label to S3 enumeration.",
      },
    ],
    supportScores: [
      {
        claimId: "s3-c-01",
        value: 0.76,
        status: "supported",
        rationale: "The broad label is directionally true.",
      },
      {
        claimId: "s3-c-02",
        value: 0.22,
        status: "unsupported",
        rationale: "The broad label is not specific enough for the evidence.",
      },
      {
        claimId: "s3-c-03",
        value: 0.14,
        status: "contradicted",
        rationale: "No exfiltration evidence appears.",
      },
    ],
    analystVerdict: {
      decision: "revise",
      summary:
        "The original label is too broad; S3 bucket enumeration after role assumption is better supported.",
      reviewer: "Synthetic reviewer",
      reviewedAt: "2026-06-13T13:44:00Z",
    },
  },
  {
    id: "case-arena-005",
    dataset: "Synthetic Identity Endpoint Pack",
    reviewStatus: "in_review",
    landscapeStatus: "uncertain",
    modelAgreement: 0.47,
    evidenceStrength: 0.49,
    uncertainty: 0.77,
    mapPosition: { x: 78, y: 42 },
    topFeatures: [
      "credential store process nearby",
      "LSASS handle query absent",
      "browser profile path read",
      "rare sequence order",
      "no successful dump",
    ],
    riskFlags: ["Suggestive evidence", "Missing decisive telemetry", "Correct uncertainty"],
    nearestNeighbor: {
      clusterId: "cluster-cred-050",
      label: "Confirmed credential dumping rehearsal",
      distance: 0.38,
      note: "Neighbour includes handle access and dump artifact evidence that this case lacks.",
    },
    cluster: {
      id: "cluster-cred-057",
      name: "Credential-access preparation region",
      description:
        "Synthetic sessions with suggestive preparation signals but no decisive credential access evidence.",
      source: "sample",
      size: 47,
    },
    topicLabel: {
      id: "label-cred-057-a",
      clusterId: "cluster-cred-057",
      name: "Possible credential access preparation",
      explanation:
        "The model correctly uses uncertainty: the evidence is suggestive, but not enough to support a stronger credential-access claim.",
      generatedBy: "Baseline AI labeler v0.7",
      generatedAt: "2026-06-13T13:31:00Z",
    },
    blindInterpretationOptions: [
      {
        id: "possible-credential-prep",
        label: "Possible credential access preparation",
        helper: "Suggestive signals exist, but decisive access evidence is missing.",
      },
      {
        id: "confirmed-credential-access",
        label: "Confirmed credential access",
        helper: "Would require dump, handle access, or credential artifact evidence.",
      },
      {
        id: "routine-profile-maintenance",
        label: "Routine profile maintenance",
        helper: "Some reads may be benign, but sequence context is unusual.",
      },
      {
        id: "not-enough-evidence",
        label: "Not enough evidence",
        helper: "Use if even the preparation claim feels too strong.",
      },
      {
        id: "none-of-these",
        label: "None of these",
        helper: "The structured choices do not fit the observed evidence.",
      },
    ],
    candidateLabels: [
      {
        id: "label-cred-baseline",
        source: "baseline_ai",
        label: "Possible credential access preparation",
        rationale:
          "Appropriately cautious and aligned to suggestive-but-incomplete evidence.",
        supportEstimate: 0.72,
      },
      {
        id: "label-cred-constrained",
        source: "evidence_constrained_ai",
        label: "Suggestive credential-access setup, insufficient proof",
        rationale:
          "Most explicit about the missing evidence that prevents a stronger claim.",
        supportEstimate: 0.76,
      },
      {
        id: "label-cred-human",
        source: "human_style",
        label: "Credential access preparation candidate",
        rationale:
          "Analyst-readable, but slightly less clear about the evidence gap.",
        supportEstimate: 0.68,
      },
      {
        id: "label-cred-uncertain",
        source: "uncertain_label",
        label: "Uncertain endpoint reconnaissance",
        rationale:
          "Cautious, but too vague about why the case is interesting.",
        supportEstimate: 0.52,
      },
    ],
    seededBestLabelId: "label-cred-constrained",
    seededImpostorSessionId: "cred-s-04",
    representativeSessions: [
      {
        id: "cred-s-01",
        title: "Browser profile read sequence",
        principal: "workstation-9\\user-k",
        timestamp: "2026-06-08T16:18:00Z",
        featureOverlap: 0.77,
        outlierScore: 0.26,
        summary: "Reads profile paths after unusual process chain; no credential artifact observed.",
      },
      {
        id: "cred-s-02",
        title: "Credential store process nearby",
        principal: "workstation-14\\user-p",
        timestamp: "2026-06-08T16:25:00Z",
        featureOverlap: 0.72,
        outlierScore: 0.31,
        summary: "Touches credential-adjacent process metadata without LSASS handle access.",
      },
      {
        id: "cred-s-03",
        title: "Rare sequence order",
        principal: "workstation-11\\user-m",
        timestamp: "2026-06-08T16:41:00Z",
        featureOverlap: 0.65,
        outlierScore: 0.43,
        summary: "Unusual ordering resembles preparation, but lacks decisive action.",
      },
      {
        id: "cred-s-04",
        title: "Browser cache cleanup",
        principal: "workstation-8\\user-q",
        timestamp: "2026-06-08T17:05:00Z",
        featureOverlap: 0.24,
        outlierScore: 0.79,
        summary:
          "Routine cleanup utility reads browser cache and profile paths without credential-adjacent features.",
        outlierReason:
          "Shares profile paths, but lacks sequence rarity and credential-adjacent process context.",
      },
      {
        id: "cred-s-05",
        title: "Failed protected path read",
        principal: "workstation-21\\user-r",
        timestamp: "2026-06-08T17:22:00Z",
        featureOverlap: 0.59,
        outlierScore: 0.49,
        summary: "AccessDenied near protected path creates suspicion but no successful access.",
      },
    ],
    failureModes: ["missing_evidence", "less_overclaimed", "better_supported"],
    defaultEvidenceRatings: {
      "cred-e-01": "weak_support",
      "cred-e-02": "weak_support",
      "cred-e-03": "contradicts_label",
      "cred-e-04": "needs_context",
    },
    claims: [
      {
        id: "cred-c-01",
        clusterId: "cluster-cred-057",
        topicLabelId: "label-cred-057-a",
        text: "The cluster contains signals suggestive of credential access preparation.",
        status: "weakly_supported",
        supportScore: 0.62,
        rationale:
          "Credential-adjacent process context and unusual sequence order provide suggestive support.",
      },
      {
        id: "cred-c-02",
        clusterId: "cluster-cred-057",
        topicLabelId: "label-cred-057-a",
        text: "The evidence confirms credential access.",
        status: "unsupported",
        supportScore: 0.12,
        rationale:
          "No LSASS handle access, credential dump, or successful credential artifact read is present.",
      },
      {
        id: "cred-c-03",
        clusterId: "cluster-cred-057",
        topicLabelId: "label-cred-057-a",
        text: "The label should preserve uncertainty.",
        status: "supported",
        supportScore: 0.82,
        rationale:
          "The evidence is suggestive but incomplete, so uncertainty is the correct framing.",
      },
    ],
    evidenceItems: [
      {
        id: "cred-e-01",
        clusterId: "cluster-cred-057",
        title: "Credential-adjacent process context",
        summary:
          "Several sessions interact with credential-store-adjacent process metadata but do not open protected handles.",
        sourceType: "session_feature",
        rawReference: "sample/endpoint/cred-057/process-context",
      },
      {
        id: "cred-e-02",
        clusterId: "cluster-cred-057",
        title: "Unusual sequence order",
        summary:
          "Synthetic sequence features resemble setup steps before a stronger credential-access behavior.",
        sourceType: "metadata",
        rawReference: "sample/endpoint/cred-057/sequence",
      },
      {
        id: "cred-e-03",
        clusterId: "cluster-cred-057",
        title: "Missing decisive access evidence",
        summary:
          "The packet has no successful dump artifact, protected handle open, or credential file read.",
        sourceType: "analyst_note",
        rawReference: "sample/endpoint/cred-057/missing-evidence",
      },
      {
        id: "cred-e-04",
        clusterId: "cluster-cred-057",
        title: "Neighbour has stronger proof",
        summary:
          "The nearest confirmed credential case includes handle access and artifact creation absent here.",
        sourceType: "metadata",
        rawReference: "sample/endpoint/cred-057/neighbour",
      },
    ],
    evidenceRelations: [
      {
        claimId: "cred-c-01",
        evidenceId: "cred-e-01",
        polarity: "supports",
        strength: "moderate",
        explanation:
          "Credential-adjacent process context supports a preparation hypothesis, but not confirmation.",
      },
      {
        claimId: "cred-c-01",
        evidenceId: "cred-e-02",
        polarity: "supports",
        strength: "weak",
        explanation: "Sequence order is suggestive but not decisive.",
      },
      {
        claimId: "cred-c-02",
        evidenceId: "cred-e-03",
        polarity: "contradicts",
        strength: "strong",
        explanation: "Missing decisive evidence contradicts a confirmed credential-access claim.",
      },
      {
        claimId: "cred-c-03",
        evidenceId: "cred-e-04",
        polarity: "supports",
        strength: "moderate",
        explanation:
          "Comparison to a stronger neighbour supports keeping uncertainty visible.",
      },
    ],
    supportScores: [
      {
        claimId: "cred-c-01",
        value: 0.62,
        status: "weakly_supported",
        rationale: "Suggestive but incomplete evidence.",
      },
      {
        claimId: "cred-c-02",
        value: 0.12,
        status: "unsupported",
        rationale: "No confirmation evidence.",
      },
      {
        claimId: "cred-c-03",
        value: 0.82,
        status: "supported",
        rationale: "Uncertainty is well grounded.",
      },
    ],
    analystVerdict: {
      decision: "accept",
      summary:
        "The uncertain framing is appropriate; a stronger credential-access label would be overclaimed.",
      reviewer: "Synthetic reviewer",
      reviewedAt: "2026-06-13T13:49:00Z",
    },
  },
];

const sampleLandscapeContextNodesData: LandscapeContextNode[] = [
  {
    id: "context-iam-041",
    nodeType: "context",
    label: "Standard platform role lifecycle",
    landscapeStatus: "supported",
    modelAgreement: 0.76,
    evidenceStrength: 0.78,
    uncertainty: 0.28,
    mapPosition: { x: 33, y: 64 },
    cluster: {
      id: "cluster-iam-041",
      name: "Standard platform role lifecycle",
      description:
        "Synthetic context-only neighbour for routine IAM role creation, policy attachment, tagging, and ticket-backed rollout metadata.",
      source: "sample",
      size: 142,
    },
    nearestNeighbor: {
      clusterId: "cluster-iam-029",
      label: "IAM role provisioning region",
      distance: 0.18,
      note: "Context neighbour shares role creation and tagging with clearer ticket metadata and lower uncertainty.",
    },
  },
];

function assertCaseIntegrity(cases: CaseFile[]): CaseFile[] {
  for (const currentCase of cases) {
    const claimIds = new Set(currentCase.claims.map((claim) => claim.id));
    const evidenceIds = new Set(currentCase.evidenceItems.map((item) => item.id));
    const scoreClaimIds = new Set(
      currentCase.supportScores.map((score) => score.claimId),
    );
    const candidateLabelIds = new Set(
      currentCase.candidateLabels.map((label) => label.id),
    );
    const sessionIds = new Set(
      currentCase.representativeSessions.map((session) => session.id),
    );

    if (!candidateLabelIds.has(currentCase.seededBestLabelId)) {
      throw new Error(
        `Case ${currentCase.id} references missing best label ${currentCase.seededBestLabelId}.`,
      );
    }

    if (!sessionIds.has(currentCase.seededImpostorSessionId)) {
      throw new Error(
        `Case ${currentCase.id} references missing impostor session ${currentCase.seededImpostorSessionId}.`,
      );
    }

    for (const evidenceId of Object.keys(currentCase.defaultEvidenceRatings)) {
      if (!evidenceIds.has(evidenceId)) {
        throw new Error(
          `Case ${currentCase.id} default rating references missing evidence ${evidenceId}.`,
        );
      }
    }

    for (const claim of currentCase.claims) {
      if (!scoreClaimIds.has(claim.id)) {
        throw new Error(
          `Case ${currentCase.id} is missing a support score for claim ${claim.id}.`,
        );
      }
    }

    for (const relation of currentCase.evidenceRelations) {
      if (!claimIds.has(relation.claimId)) {
        throw new Error(
          `Case ${currentCase.id} relation references missing claim ${relation.claimId}.`,
        );
      }

      if (!evidenceIds.has(relation.evidenceId)) {
        throw new Error(
          `Case ${currentCase.id} relation references missing evidence ${relation.evidenceId}.`,
        );
      }
    }

    for (const score of currentCase.supportScores) {
      if (!claimIds.has(score.claimId)) {
        throw new Error(
          `Case ${currentCase.id} score references missing claim ${score.claimId}.`,
        );
      }
    }
  }

  return cases;
}

export const sampleCaseSeedData: CaseFile[] =
  assertCaseIntegrity(sampleCasesData);
export const sampleLandscapeContextNodeSeedData: LandscapeContextNode[] =
  sampleLandscapeContextNodesData;
