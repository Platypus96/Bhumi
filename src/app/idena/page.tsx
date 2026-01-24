import { Fingerprint } from 'lucide-react';

export default function IdenaPage() {
  return (
    <div className="container mx-auto px-4 py-16 text-center animate-fadeInUp">
      <div className="inline-block bg-primary/10 p-6 rounded-full mb-8 border-2 border-primary/20 shadow-lg">
        <Fingerprint className="h-16 w-16 text-primary" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl font-headline">
        Proof of Person Integration
      </h1>
      <p className="mt-6 text-2xl font-semibold text-primary">
        Coming Soon
      </p>
      <div className="mt-8 max-w-2xl mx-auto text-left text-muted-foreground space-y-4">
        <p>
          We are actively working on integrating Idena, the pioneering proof-of-person blockchain, to introduce a new layer of trust and security to the Bhumi platform.
        </p>
        <p>
          This powerful integration will link property ownership to a unique, verified human identity. By doing so, we can effectively prevent duplicate accounts and ensure that every user on our platform is a real, distinct individual. This is a significant step forward in enhancing the integrity and reliability of the decentralized land registry.
        </p>
        <p className="font-semibold text-center text-foreground pt-4">
          Stay tuned for more updates on this exciting feature!
        </p>
      </div>
    </div>
  );
}
