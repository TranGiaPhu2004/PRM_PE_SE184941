// api.js
const API_URL = "https://jsonplaceholder.typicode.com/photos?_limit=200";

export async function fetchItemsFromNetwork() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Network response was not ok");
  const json = await res.json();
  // each item: { albumId, id, title, url, thumbnailUrl }
  return json;
}
