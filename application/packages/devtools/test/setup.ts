// React's `act()` only suppresses its "not wrapped in act" warning when this
// global is set, which the jsdom test environment doesn't set on its own.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
