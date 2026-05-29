/**
 * Global test setup. This file is loaded before all test files.
 */
import Chart from 'chart.js';

// Disable Chart.js animations globally for tests so requestAnimationFrame
// callbacks don't fire after DOM teardown and cause "clearRect on null" errors.
Chart.defaults.global.animation = false;
Chart.defaults.global.animation = { duration: 0 };
