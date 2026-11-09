# Dark appearance and prudent practice release · 14 October 2026

User requested further improvements to AI Mastery Atlas and Performance Powerhouse, then explicitly requested dark-mode optimisation. This release integrates a reviewed unpublished Study Library practice desk, adds a manual subscription job comparison lab and applies shared dark-first appearance across both sites and their static study pages.

The practice desk runs against an explicitly imported private source snapshot. It supports national-paper locators, original practice, cue gating, source-anchored repair prompts, private draft restore/export, and planned retest worksheets. It creates no official marks, canonical Notion entries or completed retests. Source-slide support is optional and does not claim to add new slide materials to an existing import.

The comparison lab generates one common prompt, accepts self-reported source checks, separates untested results from accepted results, retains unknown timing as unknown and includes prompting/waiting/checking time. Changed briefs, sources, criteria or response text invalidate old acceptance checks. It uses no paid API calls, background uploads or automatic renewal decisions. It has safe text rendering, share-safe entry and guarded draft replacement.

The appearance layer defaults to dark before body rendering, persists only study_ui_theme_v1, tolerates blocked storage, provides light/system alternatives and synchronizes appearance across same-origin pages. It is distinct from academic data keys. Dark playbook surfaces, native controls, secondary text, focus indicators and print styling are included. Appearance controls hide while dialogs are open.

Original source directories contained unpublished draft work. That work was preserved; this release uses isolated checkouts of the published source and copies only the reviewed relevant draft files. Existing IDs, origins, public audience and academic namespaces stay unchanged. Latest remote source must be reconciled before publication; no force push is permitted.

Required validation: framework builds, existing suites with original private Library fixture, new comparison/theme tests, practice baseline tests, JS syntax and HTML link/ID checks. Expanded-corpus-only tests may be skipped if that distinct fixture is unavailable. Real browser visual QA is unavailable in the managed environment; contrast checks cover selected palette combinations, not every rendered state or full accessibility compliance.

Rollback uses previous saved versions Atlas 71 / Powerhouse 27 without learner-data migration. Existing source imports, attempts and recovery exports remain valid. Publication details, snapshots and test counts belong in the final release record.

Publication reconciliation: merged newer source parents Atlas bfb345b and Powerhouse 0138fca. Their saved versions 72 / 28 and advanced Chemistry/Biology source panels are preserved. Updated Library version 1 was materialized separately from the original fixture and used for expanded-corpus tests. All-source data stays outside public source and deployment assets.
