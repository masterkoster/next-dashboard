// Alias endpoint for completing a flight log.
// Reuse the existing check-in handler to avoid duplicating logic.
export { POST } from '../checkin/route'
