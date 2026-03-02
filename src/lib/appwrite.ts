import { Client, Account, Databases, Storage } from 'appwrite';

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT;
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;

if (!endpoint || !projectId) {
  console.warn(
    'Appwrite environment variables are not set. Check your .env file.\n' +
    'VITE_APPWRITE_ENDPOINT and VITE_APPWRITE_PROJECT_ID are required.'
  );
}

const client = new Client();

if (endpoint && projectId) {
  client.setEndpoint(endpoint).setProject(projectId);
}

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export { client };
