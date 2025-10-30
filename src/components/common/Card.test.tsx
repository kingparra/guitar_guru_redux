import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Card from './Card';

describe('Card component (placeholder)', () => {
	it('renders without crashing', () => {
		const { container } = render(<Card>hello</Card>);
		expect(container).toBeTruthy();
	});
});
