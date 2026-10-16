"""Assess supplied aggregate evidence only; never certify a financial close."""
import json
import sys


def assess(request):
    expected = request['expected_types']
    if not expected or len(set(expected)) != len(expected):
        raise ValueError('Expected transaction types must be explicit and unique')
    if type(request['period_id']) is not int or request['period_id'] <= 0:
        raise ValueError('A resolved positive period ID is required')
    keys = ('candidate_count', 'assigned_count', 'missing_count', 'selected_period_count')
    totals = dict.fromkeys(keys, 0)
    seen = set()
    for row in request['rows']:
        kind = row['type']
        if kind not in expected or kind in seen:
            raise ValueError('Unexpected or duplicate transaction type')
        seen.add(kind)
        values = [row[k] for k in keys]
        if any(type(v) is not int or v < 0 for v in values):
            raise ValueError('Counts must be nonnegative integers')
        total, assigned, missing, selected = values
        if total != assigned + missing or selected > assigned:
            raise ValueError('Inconsistent aggregate counts')
        for key, value in zip(keys, values):
            totals[key] += value
    verified = all(request.get(k) is True for k in ('complete', 'scope_matches', 'metadata_verified'))
    status = ('unverified' if not verified else
              'empty_candidate_scope' if not totals['candidate_count'] else
              'missing_period_assignments' if not totals['assigned_count'] else
              'partial_period_assignments' if totals['missing_count'] else
              'complete_period_assignments')
    return dict(totals, status=status, period_id=request['period_id'],
                allows_complete_period_interpretation=status == 'complete_period_assignments',
                supports_clean_close=False,
                limitation='Only the supplied candidate scope is assessed. Missing assignments cannot be allocated to the selected period. This is not close certification.')


if __name__ == '__main__':
    with open(sys.argv[1]) as source:
        print(json.dumps(assess(json.load(source)), indent=2))
