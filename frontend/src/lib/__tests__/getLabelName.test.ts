import getLabelName from 'lib/getLabelName';

describe('getLabelName', () => {
	it('fills legend placeholders with label values', () => {
		expect(
			getLabelName(
				{ service: 'frontend', host: 'node-1' },
				'A',
				'{{service}} on {{host}}',
			),
		).toBe('frontend on node-1');
	});

	it('inserts label values containing $ sequences literally', () => {
		expect(
			getLabelName(
				{ name: 'price$&tax', other: 'a$$b' },
				'A',
				'{{name}} / {{other}}',
			),
		).toBe('price$&tax / a$$b');
	});
});
