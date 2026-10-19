# Optional local evidence review view

Use [review_adapter.py](review_adapter.py) for a requested or useful interactive detail table from an optional [result attachment](../contracts/RESULT-EVIDENCE.md). This is an additional fixed view, not a replacement for the shared delivery helper, domain graphics or a general dashboard/export engine. Match the user's requested format. Preserve the selected producer's source, currency and evidence requirements before presenting financial analytical content. The review renderer does not certify business correctness. Data Visualization has no external Finance Analyst dependency.

```
python3 shared/rendering/review_adapter.py result.json config.json new-review.html --receipt receipt.json
```

The receipt argument is optional. Config contains title and columns, each with field, label and type (text or decimal). Example: {"title":"Scoped cash detail","columns":[{"field":"id","label":"Reference","type":"text"},{"field":"amount","label":"Amount (USD)","type":"decimal"}]}. Use explicit units/currencies. The parent directory must exist and contain no symlink component; the output must be a new .html file. It embeds the pinned Redwood tokens and local interaction code; no remote scripts, retrieval, persistence or account actions are provided.

The table supports local text filtering, exact-decimal sorting and 25-row pagination over at most 10,000 retrieved rows. Unknowns sort after known values in either direction and stay unknown. Visible/retrieved counts and original coverage stay displayed. The provenance section retains source references, scope, grain, review state and calculation lineage. It is a snapshot, not a live dashboard or proof that every source row was retrieved.

This detail view does not add charts, clickable record links or exports. When verified record links, inline graphics, specialized charts or PDF/PowerPoint are required, use the existing supported domain renderer/export path with the same evidence and applicable checks. Do not downgrade the required linked or graphical answer to this optional table. If local execution/rendering is unavailable, use the existing permitted text/table fallback and disclose the missing view; no empty artifact or fictitious successful rendering.
