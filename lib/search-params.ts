// Utility to handle search params in Next.js 15+
export function searchParams(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  return props.searchParams;
}
