import api from "../../lib/api";

export const uploadrepository = {
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("image", file);
    const result = await api.post("upload", formData, {
      headers: {
        "Content-type": "multipart/form-data",
      },
    });
    return result.data.imageUrl;
  },
};
