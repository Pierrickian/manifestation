export function buildMessagesFromIntent(intent) {
  return [
    {
      role: 'system',
      content: 'You support a gentle inner exploration guide. Avoid absolute claims about the user.'
    },
    {
      role: 'user',
      content: JSON.stringify(intent)
    }
  ]
}
