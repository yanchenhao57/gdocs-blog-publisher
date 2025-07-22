export async function processMarkdownImagesWithCustomCDN(markdown, imageUploader) {
  const regex = /!\[(.*?)\]\((https:\/\/[^\s)]+)\)/g;
  let updatedMarkdown = markdown;

  const matches = Array.from(markdown.matchAll(regex));
  console.log("🚀 ~ processMarkdownImagesWithCustomCDN ~ matches:", matches);

  for (const match of matches) {
    const originalUrl = match[2];
    const newUrl = await imageUploader(originalUrl);
    updatedMarkdown = updatedMarkdown.replace(originalUrl, newUrl);
  }

  return updatedMarkdown;
}
