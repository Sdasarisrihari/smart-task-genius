
export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  avatar?: string; // Add the avatar property
  createdAt: Date;
}

export interface Collaborator {
  userId: string;
  displayName: string;
  photoURL?: string;
  role: 'viewer' | 'editor' | 'owner';
}
