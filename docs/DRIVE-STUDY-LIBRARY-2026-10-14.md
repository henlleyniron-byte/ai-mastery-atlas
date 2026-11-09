# Drive Study Library integration

> Superseded release status: the newer live v27/v71 baseline and current source-to-practice expansion are documented in `PHYSICS-PARITY-AND-PRACTICE-2026-10-14.md`. The save-only language below is the earlier checkpoint history, not the current production state.

The additive `/study-library/` route is a read-only, owner-imported resource workspace. Atlas navigation and its academic transfer lab link to it. Powerhouse has the same route and a main navigation entry in its saved candidate. Existing Site IDs, audiences, origins, attempts and all old persistence namespaces are unchanged.

## Import coverage

The private dated JSON consolidates 47 source records: 15 full readable text snapshots, three v2 revision workbooks with all 45 exported table sections, three V50 visual-deck links, and 26 other source links. It includes eight heatmap views and the previously audited private corpus of 1,910 references. The existing DQ01–DQ20 RemNote source supplies 770 cloze lines, displayed with answers hidden. This is not a fresh scientific audit of those cards.

Fresh bounded native Sheet snapshots retain original Biology, three-subject studio Biology/Chemistry/Physics and the independent Biology audit copy. The saved private corpus supplies separate merged views, including all 26 Physics years. Biology discrepancies and the three Chemistry unclassified records stay visible; source labels are never elevated to official validation. References follow the selected Biology mapping and year scope. Comparisons use overlapping years only. CSVs include version/status and neutralize spreadsheet formulas.

The three v2 workbook snapshots preserve their original and appended sections. In particular, an unaudited Chemistry scaffold and the later provisional heatmap coexist rather than being silently fused. Connector-readable exports preserve values, not source formatting, formulas, diagrams or exact worksheet display names. Workbook tabs are identified by export order and column headings.

Full text search covers documents and every workbook cell. Source previews conceal cloze answers and workbook answer/model-cue columns; original practice cues require an explicit reveal. Reader tables paginate at 100 rows. Reference lists paginate at 30 rows. No viewing, planning or reveal creates an attempt, mark, retest or mastery record. The Science Hub handoff exports only the existing private corpus, not session evidence.

## Privacy and recovery

No private package, Drive IDs, full documents, answer keys or personal source links are seeded into the public route. The user imports one local JSON. No fetch/upload, live Drive synchronization or app authorization is simulated. Native Sites plugin eligibility discovery is unavailable in this session, so no runtime connector declaration was guessed.

Default data lifetime is the current tab. Optional IndexedDB saving uses only `henlley_study_library_v1` / `library` / `owner-import`; saving requires an explicit click and loading requires an explicit click. A revision guard rejects stale or unloaded overwrites. Import validation is atomic. Save failures leave the current import exportable; unreadable saved bytes are not automatically replaced. Removal deletes only this resource copy. A close control clears the current tab. Share mode clears private DOM, clears the file input and disables sensitive actions; direct `?share=1` entry enables the same behavior before any read.

The delivered private file must be retained by the owner and imported separately at each origin. It is a snapshot captured 14 October 2026, not a complete Drive archive. Paid notes, exam-page bytes, slide imagery and unrelated personal files were not copied into this refresh. Historical AI model/course statements remain dated source text, not current recommendations.

## Verification and release boundary

The new model, DOM and transaction harness tests exercise the real private bundle: denominators, every matrix-to-reference cell, version disagreements, source search, cloze concealment, failed imports, denied/quota storage, revision conflicts, export and share removal. These are programmatic tests; they are not desktop/mobile browser QA or actual offline/touch verification.

Atlas's read-only source-reader shell can be published under its normal workflow. This does not publish the private corpus or the Powerhouse Science Hub session candidate. Powerhouse remains save-only under the explicit owner browser/production gate in `SCIENCE-INTEGRATION-2026-10-14.md`. Supported control-browser QA is unavailable; no improvised browser path is used. Preserve that gate on resume.

Validation commands: `STUDY_LIBRARY_PATH=<owner private JSON> SCIENCE_PACKAGE_PATH=<existing private corpus> node --test tests/*.test.mjs`; production build; TypeScript no-emit. The private JSON lives outside either checkout and must never enter source synchronization or the deployment archive.
