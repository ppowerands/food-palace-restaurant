import Link from 'next/link';

const features = [
  {
    title: 'Fast Online Ordering',
    description: 'Modern cart, menu, and checkout flows designed for Nigerian restaurants and busy customers.'
  },
  {
    title: 'Flexible Delivery Zones',
    description: 'Support delivery address validation, custom zone pricing, and minimum order thresholds.'
  },
  {
    title: 'Product Variants & Add-ons',
    description: 'Serve multiple sizes, special meal bundles, and optional side orders with every dish.'
  },
  {
    title: 'Secure Authentication',
    description: 'User accounts, JWT auth, password hashing, and optional NextAuth session support.'
  }
];

export default function HomePage() {
  return (
    <main className="relative overflow-hidden px-6 py-10 sm:px-10 lg:px-16">
      <section className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-6">
            <span className="inline-flex rounded-full bg-primary/10 px-4 py-1 text-sm font-semibold text-primary">
              Built for Nigerian restaurants
            </span>
            <h1 className="text-5xl font-semibold tracking-tight text-slate-900 dark:text-white lg:text-6xl">
              Food Palace — restaurant ordering, delivery, and menu management.
            </h1>
            <p className="text-lg leading-8 text-slate-600 dark:text-slate-300">
              Launch a production-ready restaurant commerce platform with multi-zone delivery, order management, promotions, and secure customer accounts.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/admin" className="inline-flex items-center justify-center rounded-full bg-dark px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-900">
                Admin dashboard
              </Link>
              <Link href="/" className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800">
                Start ordering
              </Link>
            </div>
          </div>
          <div className="relative max-w-xl rounded-[2rem] bg-gradient-to-br from-primary/20 via-white to-slate-100 p-8 shadow-glow dark:from-slate-900 dark:via-slate-950 dark:to-dark">
            <div className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-700">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Fresh menu categories</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Showcase jollof, suya, soups, beverages, and chef specials with rich product details.
              </p>
              <div className="mt-6 grid gap-4">
                <div className="rounded-3xl border border-slate-200 p-4 shadow-sm dark:border-slate-700">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Category</p>
                  <p className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">West African Classics</p>
                </div>
                <div className="rounded-3xl border border-slate-200 p-4 shadow-sm dark:border-slate-700">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Featured</p>
                  <p className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">Pepper soup and suya combo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-7xl">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => (
            <article key={feature.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-primary/50 hover:shadow-lg dark:border-slate-700 dark:bg-slate-950">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{feature.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
