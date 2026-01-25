import { TrendingUp } from 'lucide-react';

export default function InvestmentPage() {
  return (
    <div className="container mx-auto px-4 py-16 text-center animate-fadeInUp">
      <div className="inline-block bg-primary/10 p-6 rounded-full mb-8 border-2 border-primary/20 shadow-lg">
        <TrendingUp className="h-16 w-16 text-primary" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl font-headline">
        Making Land a Liquid Investment
      </h1>
      <p className="mt-6 text-2xl font-semibold text-primary">
        Fractional Ownership is Coming Soon
      </p>
      <div className="mt-8 max-w-2xl mx-auto text-left text-muted-foreground space-y-4">
        <p>
          We are building a groundbreaking feature that will allow you to transform your property into a divisible, tradable asset. By leveraging blockchain technology, Bhumi will enable fractional ownership, unlocking new liquidity and investment opportunities for property owners.
        </p>
        <p>
          This will allow you to sell portions of your property as shares, making real estate investment more accessible to a wider audience. Owners will be able to raise capital without selling their entire property, while investors can buy into real estate with smaller capital outlays.
        </p>
        <p className="font-semibold text-center text-foreground pt-4">
          Prepare to unlock the true potential of your property. Exciting updates are on the way!
        </p>
      </div>
    </div>
  );
}
