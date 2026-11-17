const form = document.querySelector('#song-form');
const notice = document.querySelector('#notice');
const button = document.querySelector('#generate');
async function refresh() {
  const response = await fetch('/api/songs');
  if (!response.ok) throw new Error('Could not load your songs. Refresh the page or check your Umbrel connection.');
  const songs = await response.json();
  button.disabled = songs.some(song => song.status === 'running');
  document.querySelector('#empty').hidden = songs.length > 0;
  const target = document.querySelector('#songs');
  // Retain playing audio while refreshing status.
  for (const song of [...songs].reverse()) {
    let card = document.getElementById(song.id);
    if (card && card.dataset.status === song.status) continue;
    const next = document.createElement('article');
    next.id = song.id; next.dataset.status = song.status;
    const title = document.createElement('h3'); title.textContent = song.style;
    const time = document.createElement('small'); time.textContent = new Date(song.created).toLocaleString();
    const status = document.createElement('p'); status.textContent = `${song.status}: ${song.message}`;
    next.append(time, title, status);
    if (song.status === 'complete') {
      const audio = document.createElement('audio'); audio.controls = true; audio.preload = 'none';
      audio.src = `/songs/${song.id}/audio.flac`; next.append(audio);
    }
    if (song.status !== 'running') {
      const links = document.createElement('div'); links.className = 'downloads';
      for (const name of song.files) {
        const link = document.createElement('a'); link.href = `/songs/${song.id}/${name}`;
        link.textContent = name; link.download = name; links.append(link);
      }
      next.append(links);
    }
    if (card) card.replaceWith(next); else target.prepend(next);
  }
}
form.addEventListener('submit', async event => {
  event.preventDefault(); button.disabled = true; notice.textContent = 'Starting your song…';
  try {
    const response = await fetch('/api/songs', {method:'POST', headers:{'Content-Type':'application/json','X-CSRF-Token':document.querySelector('meta[name="csrf-token"]').content}, body:JSON.stringify({style:document.querySelector('#style').value, lyrics:document.querySelector('#lyrics').value, seed:Number(document.querySelector('#seed').value)})});
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Could not start. Refresh the page and try again.');
    notice.textContent = data.message; await refresh();
  } catch (error) { notice.textContent = error.message; button.disabled = false; }
});
refresh().catch(error => notice.textContent = error.message);
setInterval(() => refresh().catch(error => notice.textContent = error.message), 5000);
