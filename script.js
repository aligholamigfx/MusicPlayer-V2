// ---------- لیست آهنگ‌ها (استریم آنلاین) ----------
const tracks = [
{ title: "زندگی چیست", artist: "منصور", src: "https://dl.nicmusic.net/upload/2025/08/19/12%20Zendegi%20Chist.mp3", duration: "03:20" },
{ title: "لحضه ها", artist: "معین", src: "https://dl.nicmusic.net/upload/2025/08/01/02%20Moments%20%28Lahzeha%29.mp3", duration: "05:16" },
{ title: "شاه مقصود", artist: "محسن چاوشی", src: "https://dl.nicmusic.net/nicmusic/023/045/Mohsen%20Chavoshi%20-%20Shah%20Maghsoud%20320.mp3", duration: "06:41" },
{ title: "چلچله", artist: "علیرضا افتخاری", src: "https://dl.nicmusic.net/upload/2024/12/07/Alireza%20Eftekhari%20-%20Chelcheleh.mp3", duration: "06:44" },
];

// ---------- عناصر DOM ----------
const audioPlayer = document.getElementById('audioPlayer');
const playBtn = document.getElementById('playBtn');
const playIcon = document.getElementById('playIcon');
const pauseIcon = document.getElementById('pauseIcon');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const repeatBtn = document.getElementById('repeatBtn');
const repeatBadge = document.getElementById('repeatBadge');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const trackTitle = document.getElementById('trackTitle');
const trackArtist = document.getElementById('trackArtist');
const albumArt = document.getElementById('albumArt');
const playlistToggle = document.getElementById('playlistToggle');
const closePlaylist = document.getElementById('closePlaylist');
const playlistPanel = document.getElementById('playlistPanel');
const playlistEl = document.getElementById('playlist');
const visualizer = document.getElementById('visualizer');

// ولوم
const volumeSlider = document.getElementById('volumeSlider');
const volumeFill = document.getElementById('volumeFill');
const volumePercent = document.getElementById('volumePercent');
const volumeTrack = document.querySelector('.volume-track');
const downloadBtn = document.getElementById('downloadBtn');

// ---------- متغیرهای وضعیت ----------
let currentTrackIndex = 0;
let isPlaying = false;
let isShuffle = false;
let repeatMode = 0; // 0: off, 1: all (چرخه همه), 2: one (تکرار یک)

// ---------- ویژوالایزر ----------
function startVisualizer() { visualizer.classList.add('active'); }
function stopVisualizer() { visualizer.classList.remove('active'); }

// ---------- کنترل ولوم ----------
function setVolume(value) {
    let v = Math.min(100, Math.max(0, parseInt(value) || 0));
    audioPlayer.volume = v / 100;
    volumePercent.textContent = `${v}%`;
    volumeSlider.value = v;
    volumeFill.style.width = `${v}%`;
}
volumeSlider.addEventListener('input', (e) => setVolume(e.target.value));
volumeTrack.addEventListener('click', (e) => {
    const rect = volumeTrack.getBoundingClientRect();
    let clickX = e.clientX - rect.left;
    let percent = (clickX / rect.width) * 100;
    percent = Math.min(100, Math.max(0, percent));
    setVolume(percent);
});
setVolume(65); // مقدار پیش‌فرض

// ---------- توابع کمکی پلیر ----------
function loadTrack(index) {
    const track = tracks[index];
    audioPlayer.src = track.src;
    trackTitle.textContent = track.title;
    trackArtist.textContent = track.artist;
    durationEl.textContent = track.duration;
    updateActivePlaylistItem();
    if (isPlaying) play();
}
function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}
function play() {
    audioPlayer.play().catch(e => console.warn(e));
    isPlaying = true;
    playIcon.style.display = 'none';
    pauseIcon.style.display = 'block';
    albumArt.classList.add('playing');
    startVisualizer();
}
function pause() {
    audioPlayer.pause();
    isPlaying = false;
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
    albumArt.classList.remove('playing');
    stopVisualizer();
}
function playNextTrack() {
    if (isShuffle) {
        let newIndex;
        do { newIndex = Math.floor(Math.random() * tracks.length); } 
        while (newIndex === currentTrackIndex && tracks.length > 1);
        currentTrackIndex = newIndex;
    } else {
        currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
    }
    loadTrack(currentTrackIndex);
    if (isPlaying) play();
}
function playPrevTrack() {
    if (isShuffle) {
        let newIndex;
        do { newIndex = Math.floor(Math.random() * tracks.length); } 
        while (newIndex === currentTrackIndex && tracks.length > 1);
        currentTrackIndex = newIndex;
    } else {
        currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    }
    loadTrack(currentTrackIndex);
    if (isPlaying) play();
}

// ---------- دکمه‌ها (برعکس برای RTL) ----------
nextBtn.addEventListener('click', () => playPrevTrack());
prevBtn.addEventListener('click', () => playNextTrack());

// Shuffle
shuffleBtn.addEventListener('click', () => {
    isShuffle = !isShuffle;
    shuffleBtn.classList.toggle('active');
});

// Repeat (با بج)
function updateRepeatUI() {
    if (repeatMode === 0) {
        repeatBtn.classList.remove('active');
        repeatBtn.style.opacity = '1';
        repeatBadge.style.display = 'none';
    } else if (repeatMode === 1) {
        repeatBtn.classList.add('active');
        repeatBtn.style.opacity = '1';
        repeatBadge.style.display = 'flex';
        repeatBadge.textContent = 'A';
        repeatBadge.style.background = '#2f8b64';
    } else {
        repeatBtn.classList.add('active');
        repeatBtn.style.opacity = '0.7';
        repeatBadge.style.display = 'flex';
        repeatBadge.textContent = '1';
        repeatBadge.style.background = '#1f6a4a';
    }
}
repeatBtn.addEventListener('click', () => {
    repeatMode = (repeatMode + 1) % 3;
    updateRepeatUI();
});
playBtn.addEventListener('click', () => isPlaying ? pause() : play());

// ---------- رویداد پایان آهنگ (تکرار) ----------
audioPlayer.addEventListener('ended', () => {
    if (repeatMode === 2) {
        audioPlayer.currentTime = 0;
        play();
    } else if (repeatMode === 1) {
        playNextTrack();
    } else {
        if (currentTrackIndex < tracks.length - 1) {
            playNextTrack();
        } else {
            pause();
            audioPlayer.currentTime = 0;
        }
    }
});

// ---------- پیشرفت آهنگ و نوار زمان ----------
audioPlayer.addEventListener('timeupdate', () => {
    if (audioPlayer.duration && !isNaN(audioPlayer.duration)) {
        let percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressFill.style.width = `${percent}%`;
        currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
    }
});
audioPlayer.addEventListener('loadedmetadata', () => {
    if (audioPlayer.duration && !isNaN(audioPlayer.duration))
        durationEl.textContent = formatTime(audioPlayer.duration);
});
progressBar.addEventListener('click', (e) => {
    const rect = progressBar.getBoundingClientRect();
    let clickX = e.clientX - rect.left;
    let percent = clickX / rect.width;
    if (audioPlayer.duration) audioPlayer.currentTime = percent * audioPlayer.duration;
});

// ---------- دانلود آهنگ جاری ----------
async function downloadCurrentTrack() {
    const track = tracks[currentTrackIndex];
    if (!track.src) return;
    try {
        const response = await fetch(track.src);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${track.title} - ${track.artist}.mp3`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch { window.open(track.src, '_blank'); }
}
downloadBtn.addEventListener('click', downloadCurrentTrack);

// ---------- لیست پخش ----------
function createPlaylist() {
    playlistEl.innerHTML = '';
    tracks.forEach((track, idx) => {
        const item = document.createElement('div');
        item.className = 'playlist-item';
        if (idx === currentTrackIndex) item.classList.add('active');
        item.innerHTML = `<div class="playlist-item-number">${idx+1}</div>
            <div class="playlist-item-info">
                <div class="playlist-item-title">${track.title}</div>
                <div class="playlist-item-artist">${track.artist}</div>
            </div>
            <div class="playlist-item-duration">${track.duration}</div>`;
        item.addEventListener('click', () => { currentTrackIndex = idx; loadTrack(idx); play(); });
        playlistEl.appendChild(item);
    });
}
function updateActivePlaylistItem() {
    document.querySelectorAll('.playlist-item').forEach((item, idx) => {
        if (idx === currentTrackIndex) item.classList.add('active');
        else item.classList.remove('active');
    });
}

playlistToggle.addEventListener('click', () => playlistPanel.classList.remove('hidden'));
closePlaylist.addEventListener('click', () => playlistPanel.classList.add('hidden'));

// ---------- میانبرهای کیبورد ----------
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') { e.preventDefault(); isPlaying ? pause() : play(); }
    else if (e.code === 'ArrowLeft') audioPlayer.currentTime = Math.max(0, audioPlayer.currentTime - 5);
    else if (e.code === 'ArrowRight') audioPlayer.currentTime = Math.min(audioPlayer.duration, audioPlayer.currentTime + 5);
    else if (e.code === 'ArrowUp') { e.preventDefault(); let newVol = Math.min(100, audioPlayer.volume * 100 + 10); setVolume(newVol); }
    else if (e.code === 'ArrowDown') { e.preventDefault(); let newVol = Math.max(0, audioPlayer.volume * 100 - 10); setVolume(newVol); }
});

// ---------- مقداردهی اولیه ----------
function init() {
    loadTrack(0);
    createPlaylist();
    updateRepeatUI();
}
init();