export type Trip = {
  id: string;
  title: string;
  note: string;
  date: string;
  location: string;
  image: string | null;        // Cloudinary secure_url
  imagePublicId?: string | null; // Cloudinary public_id (optional)
  folder?: string;             // Folder/category name (optional)
};
