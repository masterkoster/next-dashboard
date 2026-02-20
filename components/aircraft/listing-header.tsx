import { CheckCircle2, Building2 } from "lucide-react"

interface ListingHeaderProps {
  title: string;
  nNumber?: string | null;
  price: number | null;
  isVerified?: boolean | null;
  sellerType?: string | null;
}

export function ListingHeader({ title, nNumber, price, isVerified, sellerType }: ListingHeaderProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          {isVerified && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Verified
            </span>
          )}
          {sellerType === 'DEALER' && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              <Building2 className="h-3.5 w-3.5" />
              Dealer
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl text-balance">
          {title}
        </h1>
        {nNumber && (
          <p className="font-mono text-sm text-muted-foreground">
            N-Number: {nNumber}
          </p>
        )}
      </div>
      <div className="flex flex-col items-start lg:items-end">
        {price && (
          <>
            <span className="text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
              ${price.toLocaleString()}
            </span>
            <span className="mt-1 text-xs text-muted-foreground">
              Or make an offer
            </span>
          </>
        )}
      </div>
    </div>
  )
}
