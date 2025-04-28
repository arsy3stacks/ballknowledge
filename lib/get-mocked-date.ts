export function getMockedDate() {
	const now = new Date();
	return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // Add 7 days
}
