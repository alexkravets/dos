
/** Pause execution for a specified number of milliseconds. */
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default wait;
