"""Standard-library regressions; run separately with python3 -m unittest discover."""
import copy
import hashlib
import json
from pathlib import Path
import sys
import unittest

VISUAL = Path(__file__).resolve().parents[1] / 'common/skills/suiteskills/netsuite-suiteskills-operations/runbooks/netsuite-data-visualization'
sys.dont_write_bytecode = True
sys.path.insert(0, str(VISUAL / 'scripts'))
from contract import validate
from renderer import render, validate_html, TRUST


class FinancialVisualizationTests(unittest.TestCase):
    def example(self, name='supplied-revenue'):
        return json.loads((VISUAL / 'examples' / (name + '.json')).read_text())

    def test_examples_immutable_and_canonical(self):
        for path in sorted((VISUAL / 'examples').glob('*.json')):
            with self.subTest(example=path.name):
                model = json.loads(path.read_text())
                original = copy.deepcopy(model)
                self.assertEqual(validate(model), original)
                document = render(model)
                self.assertEqual(validate_html(document), original)
                self.assertEqual(model, original)
                with self.assertRaises(ValueError):
                    validate_html(document.replace('</body>', '<script>alert(1)</script></body>'))

    def test_financial_labels_on_operational_data(self):
        model = self.example('supplied-inventory')
        model['title'] = 'CFO cash budget forecast and receivables'
        model['columns'][0]['label'] = 'Financial statement'
        model['charts'][0]['title'] = 'Revenue variance'
        validate_html(render(model))

    def test_currency_required_and_units_match(self):
        for currency, unit in [(None, 'USD'), ('USD', 'EUR'), ('usd', 'usd'), ('USD', 'thousands')]:
            with self.subTest(currency=currency, unit=unit):
                model = self.example()
                model['columns'][1].update(currency=currency, unit=unit)
                with self.assertRaises(ValueError):
                    validate(model)
        model = self.example()
        del model['columns'][1]['currency']
        with self.assertRaises(ValueError):
            validate(model)

    def test_mixed_currency_series(self):
        model = self.example()
        model['columns'][2].update(currency='EUR', unit='EUR')
        with self.assertRaisesRegex(ValueError, 'currency'):
            validate(model)

    def test_mixed_currency_intervals(self):
        model = self.example()
        model['columns'] = model['columns'][:2] + [
            dict(model['columns'][1], key='start', label='Start'),
            dict(model['columns'][1], key='end', label='End', currency='EUR', unit='EUR')]
        model['rows'] = [{'month': '2026-09-01', 'revenue': 10, 'start': 0, 'end': 10}]
        model['source']['expected_rows'] = 1
        model['charts'] = [{'type': 'waterfall', 'title': 'Cash', 'x': 'month', 'y': 'revenue', 'start': 'start', 'end': 'end'}]
        with self.assertRaisesRegex(ValueError, 'currency'):
            validate(model)
        model['columns'][-1].update(currency='USD', unit='USD')
        validate(model)

    def test_missing_values_are_not_zero(self):
        for missing in (None, 'absent'):
            model = self.example()
            if missing is None:
                model['rows'][0]['revenue'] = None
            else:
                del model['rows'][0]['revenue']
            with self.assertRaises(ValueError):
                validate(model)

    def test_asset_pins(self):
        self.assertEqual(set(TRUST), {'view.js', 'view.css'})
        for name, digest in TRUST.items():
            self.assertEqual(hashlib.sha256((VISUAL / 'assets' / name).read_bytes()).hexdigest(), digest)


if __name__ == '__main__':
    unittest.main()
