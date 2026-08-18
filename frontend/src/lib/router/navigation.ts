import history from 'lib/history';

import type {
	AppLocation,
	NavigateOptions,
	NavigationAction,
	NavigationBlocker,
	To,
} from './types';
import { applyNavigate, retryTransition, toAppLocation } from './utils';

let entryKeys: Array<string | undefined> = [history.location.key];
let entryIndex = 0;

function indexOfEntry(key: string | undefined): number {
	return Math.max(0, entryKeys.indexOf(key));
}

// history@4 reports a blocked POP's target but not how far away it is, and the
// POP is already reverted by the time `retry` runs. Mirroring its entry keys
// gives the distance back.
history.listen((location, action) => {
	// Reverting a blocked POP notifies again with the unchanged location.
	if (location.key === entryKeys[entryIndex]) {
		return;
	}
	if (action === 'PUSH') {
		entryKeys = [...entryKeys.slice(0, entryIndex + 1), location.key];
		entryIndex += 1;
	} else if (action === 'REPLACE') {
		entryKeys[entryIndex] = location.key;
	} else {
		entryIndex = indexOfEntry(location.key);
	}
});

/**
 * Module-level imperative navigation, the escape hatch for code outside a
 * component. Unlike `useSafeNavigate` it does not suppress same-URL navigation
 * and has no new-tab branch, because it cannot see the current render.
 *
 * The basename contract, stable across the migration: callers pass and receive
 * basename-free app paths. history@4 implements that itself today; at the
 * version flip the basename moves onto the router, which does not cover this
 * module, so `navigate`/`getCurrentLocation` take it over then.
 */
export function navigate(to: To, options?: NavigateOptions): void {
	applyNavigate(history, to, options);
}

export function back(): void {
	history.goBack();
}

export function getCurrentLocation(): AppLocation {
	return toAppLocation(history.location);
}

export function subscribe(
	listener: (update: {
		location: AppLocation;
		action: NavigationAction;
	}) => void,
): () => void {
	return history.listen((location, action) => {
		listener({
			location: toAppLocation(location),
			action: action as NavigationAction,
		});
	});
}

export function blockNavigation(blocker: NavigationBlocker): () => void {
	return history.block((location, action) => {
		const appLocation = toAppLocation(location);
		const navigationAction = action as NavigationAction;
		const popDelta = indexOfEntry(location.key) - entryIndex;
		let deciding = true;
		let allowed = false;

		blocker({
			location: appLocation,
			action: navigationAction,
			retry: () => {
				if (deciding) {
					allowed = true;
					return;
				}
				retryTransition(history, appLocation, navigationAction, popDelta);
			},
		});
		deciding = false;

		// history@4 cancels the transition when the prompt returns `false`;
		// history@5 cancels whenever a blocker is registered and hands control to
		// `retry()`. A `retry()` inside the blocker means "let it through", and
		// history@4 does that by not cancelling: re-issuing a POP would walk the
		// stack twice.
		return allowed ? undefined : false;
	});
}

export { hasInAppHistory } from 'lib/history';
