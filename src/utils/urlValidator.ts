import axios from 'axios';

export const validateURL = async (url: string): Promise<boolean> => {
  try {
    const response = await axios.head(url);
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

export const validateXMLFile = (url: string): boolean => {
  return url.endsWith('.xml');
};