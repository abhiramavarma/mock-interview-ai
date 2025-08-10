import { createApp } from '../server/index';

let app;

export default async (req, res) => {
  if (!app) {
    const { app: createdApp } = await createApp();
    app = createdApp;
  }
  return app(req, res);
};
