/** Serves the static export on a fixed port, for the e2e suite. */
import { startStaticServer } from './static-server';

const port = Number(process.argv[2] ?? 4321);

startStaticServer(port).then(({ origin }) => {
  console.log(`serving out/ at ${origin}`);
});
