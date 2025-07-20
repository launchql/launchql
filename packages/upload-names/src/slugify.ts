export default (text: string) => {
  text = text.toString().trim();
  
  text = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  return text
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
};