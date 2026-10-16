# Runtime selection and host file delivery

This is the file workflow for Data Visualization only. Other shared writers keep their separate publication requirements. Work internally through the available tools; users ask for a chart, not filesystem diagnosis. Generated, validated, delivery_pending, delivered, delivered_validation_failed and unavailable are distinct states.

## Select the actual executor

Use actual runtime and host/tool observations. Desktop product/OS names do not establish executor capabilities. `python3 scripts/visualize.py --capabilities --output-dir /actual/private/source --format html` performs a small synthetic create/link/fsync probe and removes its objects; it creates no business artifact. Choose an existing authorized real directory outside package assets. Never infer a path, mount, executable or host transport API from these examples.

| Executor | HTML source generation | Requested PDF / PowerPoint |
| --- | --- | --- |
| Darwin and local APFS | Standard library and fixed packaged assets | Existing reviewed Node/Playwright/Chromium; PDF additionally needs pypdf and the qualified font |
| Linux glibc 2.39, little-endian LP64 x86_64/aarch64, ext-family | Internal candidate with checked ABI and successful publication probe; exact-host qualification separately recorded | Unavailable in this increment |
| FUSE or unknown source filesystem/ABI/OS | No source publication | No source publication |

The hosted claude.ai GNU/Linux sandbox is a qualification target; current candidate Linux execution/import/delivery is not_run until tested there against exact hashes. Previously reported prototype results do not qualify this version. On Linux do not treat missing browser/font as an HTML dependency failure. Unknown libc layouts refuse before native output-buffer calls.

An observed host-managed FUSE output location is a potential transfer destination rather than a source root. The read-only `capabilities.classify_destination(directory, host_contract)` helper needs the exact directory and a bounded evidence identifier from actual host observations. That operational input does not authenticate itself or grant permission. Never obtain it from business/spec data. Without established host evidence, capability mode reports publication-ineligible storage and requires establishing that evidence; it does not ask the user to repair managed ownership.

## Generate and validate a private source

Prepare the closed spec and optional independently verified binding under the runbook's evidence rules. Generate ordinary HTML through `visualize.py SPEC --output-dir ROOT`; choose `--format pdf|pptx` only when requested and prerequisites pass. Keep source publication exclusive. Existing paths, unsafe names, aliases and package roots refuse; no generic writer bypass exists.

If managed transfer will be needed, select `--managed-delivery` at generation time. It adds a trusted 128-bit random suffix to the validated export basename, preserving the existing limits. Source and destination must use that exact name. An overlong base refuses rather than silently truncating it. Keep the original spec export_name unchanged for snapshot identity.

`verify_delivery.py SPEC --artifact SOURCE --format html --create-handoff` returns a closed artifact identity: SHA-256, bytes, filename/format and model/binding digests. Keep it in tool context, or persist it only through the qualified publisher. The handoff contains no rows or raw account/session payload. It proves content association, not account authentication or native delivery.

## Present through the actual host

1. **Direct path:** if the qualified source root is already served by the actual host's file-link/preview facility, validate final readback and provide its observed link. A filesystem path alone is not proof of download availability.
2. **Managed transfer:** use only the actual exposed native presentation facility and established output boundary. Never fabricate its name/schema, assume `/mnt` exists, copy directly to FUSE with a generic command, change destination permissions or install a transport.
3. If the facility guarantees exclusive destination creation, retain that observed guarantee. If it can overwrite, use the **collision-avoidance profile**, whose destination guarantee is explicitly weaker: immediately before the single transfer invocation run `verify_delivery.py --precheck-destination ACTUAL_DESTINATION --handoff HANDOFF`. Any existing file/directory/dangling symlink or indeterminate check refuses the transfer. An absence result is an observation, not an atomic reservation. Benign concurrent activity can race it; random names reduce likelihood but do not establish no-replacement.
4. Retain the selected directory/name, check time and outcome in tool evidence, not a full directory listing. Do not transfer under a different or automatically renamed basename. If a host changes the name, stop and establish a new exact source/handoff/check rather than claiming the old check applies.
5. After transfer, run `verify_delivery.py SPEC --artifact ACTUAL_DESTINATION_FILE --format html --handoff HANDOFF`, selecting the same binding again when present. Use the actual format for PDF/PPTX. Read-only validation can inspect a regular destination file on publication-ineligible storage; it needs no writable output directory or source-publication support.
6. Report **delivered** only with a successful exact readback and the host's observed destination/link information. The verifier returns **validated**, never delivered. Hash agreement cannot prove destination permissions, collision freedom, source-account origin or tool authentication. Record the transport guarantee (`exclusive` or `collision_avoidance_not_atomic`) separately.

An application needing atomic destination no-replacement cannot use the weaker profile. If transfer/readback/link capability is missing, retain the validated private source and state delivery_pending or unavailable. A claimed tool success alone is insufficient. A corrupt or mismatched destination is delivered_validation_failed; do not publish its link as a verified result or automatically overwrite/delete it to repair the failure.

## Preserve useful output and privacy

Give the material finding, source scope and verified facts/table when the requested file cannot be generated or delivered. Example: “File delivery is unavailable in this session. Here is the verified table.” Keep inode, uid and filesystem-magic details in technical evidence, not the user-facing explanation; do not ask the user to fix host-managed storage.

The reported ns_getSessionInfo interface supplies no verified UI origin. Keep references plain text on that path, never derive a hostname from accountId, and never fetch/hash/embed its full session/feature/permission/preference payload just for delivery. A digest is not authentication. The existing independently verified minimal binding contract remains separate. Support-case routes are not added. Financial output still requires the actual unavailable Finance Analyst handoff.

A missing visual-inspection facility does not by itself invalidate canonical HTML or verified delivery. When content gates, transfer readback and the observed link pass, provide the validated HTML file and clearly disclose that rendered appearance was not inspected. Do not claim readability or visual QA passed; retain the verified facts/table.
