import { ReactElement, ReactNode, useRef } from 'react';
import { Route, Router } from 'react-router-dom';
import { CompatRouter, useInRouterContext } from 'react-router-dom-v5-compat';
import history from 'lib/history';

// The router half of the test harness. It lives apart from `test-utils` so that
// a test can mount a router without also inheriting that module's global mocks,
// fake system time and provider stack.
//
// Unlike a `MemoryRouter`:
//
// - The tree mounts on the `lib/history` singleton, mirroring the real mount in
//   `src/AppRoutes/index.tsx`, so imperative `navigate()` calls move the router.
// - `CompatRouter` is always present, so the v6-only facade hooks
//   (`useAppSearchParams`, `useAppNavigationType`) work without each test
//   knowing to add it.
//
// A `TestRouter` inside another one renders its children without a second
// router, which v6 does not allow, but still seeds `initialRoute`: the
// innermost seed wins.

interface TestRouterProps {
	children: ReactNode;
	/**
	 * Seeded onto the history singleton before the router reads it. Omit to mount
	 * at whatever URL the test has already set up. `render()` and
	 * `AllTheProviders` default it to `/`.
	 */
	initialRoute?: string;
	/**
	 * Route pattern(s) to mount the children under, for a component that reads
	 * `useParams`. Matching is exact, which is v6's default, so the eventual
	 * `<Routes>` swap does not change which tests match.
	 */
	routePath?: string | string[];
}

export function TestRouter({
	children,
	initialRoute,
	routePath,
}: TestRouterProps): ReactElement {
	const nested = useInRouterContext();

	// The seed has to land before `<Router>` reads `history.location`, hence the
	// render body rather than an effect. The ref keeps it to the first render, so
	// a navigation made by the component under test is not undone.
	const seeded = useRef(false);
	if (!seeded.current) {
		seeded.current = true;
		if (initialRoute) {
			history.replace(initialRoute);
		}
	}

	const tree = routePath ? (
		<Route exact path={routePath}>
			{children}
		</Route>
	) : (
		children
	);

	if (nested) {
		return <>{tree}</>;
	}

	return (
		<Router history={history}>
			<CompatRouter>{tree}</CompatRouter>
		</Router>
	);
}

TestRouter.defaultProps = {
	initialRoute: undefined,
	routePath: undefined,
};

/** Returns the history singleton to the state a suite should start each test in. */
export function resetTestRoute(): void {
	history.replace('/');
}
