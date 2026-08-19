import { render, screen } from '@testing-library/react';
import { navigate } from 'lib/router/navigation';
import { useAppLocation } from 'lib/router/useAppLocation';

import { resetTestRoute, TestRouter } from './router';

function Pathname(): JSX.Element {
	const { pathname } = useAppLocation();
	return <span data-testid="pathname">{pathname}</span>;
}

describe('TestRouter', () => {
	beforeEach(() => {
		resetTestRoute();
	});

	it('mounts at initialRoute', () => {
		render(
			<TestRouter initialRoute="/logs">
				<Pathname />
			</TestRouter>,
		);

		expect(screen.getByTestId('pathname')).toHaveTextContent('/logs');
	});

	it('keeps the existing URL when initialRoute is omitted', () => {
		navigate('/existing');

		render(
			<TestRouter>
				<Pathname />
			</TestRouter>,
		);

		expect(screen.getByTestId('pathname')).toHaveTextContent('/existing');
	});

	it('renders a nested TestRouter on the same router, and the innermost initialRoute wins', () => {
		render(
			<TestRouter initialRoute="/outer">
				<TestRouter initialRoute="/inner">
					<Pathname />
				</TestRouter>
			</TestRouter>,
		);

		expect(screen.getByTestId('pathname')).toHaveTextContent('/inner');
	});

	it('keeps the outer route when the nested TestRouter has no initialRoute', () => {
		render(
			<TestRouter initialRoute="/outer">
				<TestRouter>
					<Pathname />
				</TestRouter>
			</TestRouter>,
		);

		expect(screen.getByTestId('pathname')).toHaveTextContent('/outer');
	});
});
