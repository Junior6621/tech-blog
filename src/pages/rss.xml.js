import rss, { pagesGlobToRssItems } from '@astrojs/rss';

export async function GET(context) {
  return rss({
    title: 'Patton Tech Blog',
    description: 'Cybersecurity, Cloud Infrastructure, and IT Strategy updates.',
    site: context.site,
    items: await pagesGlobToRssItems(
      import.meta.glob('./blog/*.{md,mdx}'),
    ),
    customData: `<language>en-us</language>`,
  });
}
